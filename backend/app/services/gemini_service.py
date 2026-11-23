import json
import logging
import re
from typing import Optional, List, Dict, Any
from google import genai
from google.genai import types
from app.config import settings
from app.schemas.analysis import GeminiAnalysisResult

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an agricultural plant-health analysis assistant.
Analyze the supplied plant photograph carefully.
Identify the likely plant species if possible.
Evaluate visible symptoms such as leaf spots, yellowing, discoloration, wilting, pest damage, fungal-like growth, and nutrient deficiency indicators.
Do not assume that every abnormality is caused by disease.
Distinguish observed symptoms from possible causes.
If the photograph is unclear, explain what additional image is required.
Never fabricate a disease diagnosis. If the image is unclear or you cannot identify a problem confidently, return an inconclusive result instead of inventing a diagnosis.
Provide practical treatment and prevention recommendations.
Return the result strictly in the required structured JSON format."""

STRUCTURED_JSON_TEMPLATE = """
Respond ONLY with a valid JSON object matching this schema:
{
  "plant_identification": {
    "common_name": "Common name or 'Unidentified Plant'",
    "scientific_name": "Latin binomial or 'Unknown'",
    "identification_confidence": 0.85
  },
  "health_assessment": {
    "health_score": 85,
    "health_status": "Good",
    "severity": "None"
  },
  "detected_issues": [
    {
      "issue_name": "Name of issue or 'Healthy'",
      "possible_disease": "Disease name or 'None'",
      "confidence": 0.9,
      "observed_symptoms": ["Symptom 1", "Symptom 2"],
      "possible_causes": ["Cause 1", "Cause 2"]
    }
  ],
  "nutrient_assessment": {
    "possible_deficiencies": ["Nitrogen", "Iron"],
    "observations": "Detailed nutrient status"
  },
  "treatment": {
    "immediate_actions": ["Action 1", "Action 2"],
    "organic_treatments": ["Organic method 1"],
    "other_treatment_options": ["Chemical/conventional option with safety caution"],
    "preventive_measures": ["Prevention tips"]
  },
  "plant_care": {
    "watering": "Recommended watering regimen",
    "sunlight": "Sunlight requirements",
    "soil": "Soil preferences and pH",
    "fertilizer": "Fertilization guidance"
  },
  "monitoring": {
    "next_check_days": 7,
    "additional_observations": ["What to watch for in coming days"]
  },
  "analysis_summary": "Comprehensive professional summary of plant condition",
  "limitations": [
    "These scores are indicative AI assessments, not laboratory measurements.",
    "Visual assessment cannot definitively rule out microscopic pathogens or root ailments."
  ]
}

Note for health_score and health_status:
90-100: Excellent
75-89: Good
50-74: Moderate
25-49: Poor
0-24: Critical
"""

CANDIDATE_MODELS = [
    settings.GEMINI_MODEL,
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
]

def clean_json_text(raw_text: str) -> str:
    """Strip markdown codeblocks like ```json ... ``` if returned."""
    text = raw_text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first line if ```json or ```
        if lines[0].startswith("```"):
            lines = lines[1:]
        # Remove last line if ```
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text

def get_gemini_client() -> Optional[genai.Client]:
    api_key = settings.GEMINI_API_KEY.strip()
    if not api_key:
        return None
    try:
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.error(f"Failed to initialize Gemini Client: {e}")
        return None

def check_gemini_status() -> Dict[str, Any]:
    api_key = settings.GEMINI_API_KEY.strip()
    if not api_key:
        return {
            "configured": False,
            "message": "Gemini API key is missing. Add GEMINI_API_KEY in backend/.env",
            "model": settings.GEMINI_MODEL
        }
    
    masked = api_key[:6] + "..." + api_key[-4:] if len(api_key) > 10 else "configured"
    return {
        "configured": True,
        "masked_key": masked,
        "model": settings.GEMINI_MODEL,
        "message": "Gemini API configured and ready."
    }

async def analyze_plant_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> GeminiAnalysisResult:
    """
    Analyzes a plant photo using Google Gemini Multimodal Vision API.
    Returns validated structured GeminiAnalysisResult.
    """
    client = get_gemini_client()
    if not client:
        raise ValueError(
            "GEMINI_API_KEY is not configured on the server. "
            "Please configure your Google Gemini API key in backend/.env to enable live plant diagnostics."
        )

    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    full_prompt = f"{SYSTEM_PROMPT}\n\n{STRUCTURED_JSON_TEMPLATE}"

    last_error = None
    for model_name in CANDIDATE_MODELS:
        try:
            logger.info(f"Attempting plant health analysis with model: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=[image_part, full_prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )
            
            raw_json = clean_json_text(response.text)
            parsed_data = json.loads(raw_json)
            
            # Validate through Pydantic
            result = GeminiAnalysisResult.model_validate(parsed_data)
            return result
        except Exception as e:
            logger.warning(f"Model {model_name} analysis failed: {e}")
            last_error = e

    raise RuntimeError(f"Plant analysis failed across available Gemini models: {last_error}")

async def ask_plant_assistant(
    prompt: str,
    chat_history: List[Dict[str, str]] = None,
    context: Optional[str] = None
) -> str:
    """
    Conversational Plant Care Assistant using Gemini.
    Maintains session history and applies agricultural safety instructions.
    """
    client = get_gemini_client()
    if not client:
        raise ValueError(
            "GEMINI_API_KEY is not configured on the server. "
            "Please configure your Google Gemini API key in backend/.env to chat with the Plant Care Assistant."
        )

    system_instruction = (
        "You are PlantCare AI's conversational agricultural and gardening specialist. "
        "Answer questions clearly, practically, and scientifically about plant diseases, plant care, soil, "
        "watering, sunlight, fertilizers, organic gardening, pest prevention, and agricultural best practices. "
        "Always maintain a supportive, expert, and encouraging tone. "
        "Important safety precautions: "
        "- Clearly distinguish possible causes from confirmed diagnoses. "
        "- For any pesticide or chemical recommendations, emphasize protective gear and reading manufacturer labels. "
        "- Do not provide unsupported chemical dosages or medical/toxicological claims. "
        "- Always advise consulting a local agricultural extension office or agronomist for commercial crop decisions."
    )
    
    if context:
        system_instruction += f"\n\nContext regarding the user's specific plant:\n{context}"

    # Build conversation contents
    contents = []
    if chat_history:
        for msg in chat_history[-10:]:  # last 10 messages for context window
            role = "user" if msg.get("role") == "user" else "model"
            contents.append(types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg.get("content", ""))]
            ))
            
    contents.append(types.Content(
        role="user",
        parts=[types.Part.from_text(text=prompt)]
    ))

    last_error = None
    for model_name in CANDIDATE_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                    max_output_tokens=1500,
                )
            )
            return response.text
        except Exception as e:
            logger.warning(f"Assistant model {model_name} failed: {e}")
            last_error = e

    raise RuntimeError(f"Chat failed with Gemini API: {last_error}")
