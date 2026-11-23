import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from app.models.analysis import PlantAnalysis

# Theme Colors
PRIMARY_GREEN = colors.HexColor("#16834A")
DARK_GREEN = colors.HexColor("#104B32")
LIGHT_GREEN = colors.HexColor("#E8F5E9")
TEXT_DARK = colors.HexColor("#1F2937")
TEXT_MUTED = colors.HexColor("#4B5563")
BORDER_COLOR = colors.HexColor("#D1D5DB")
ACCENT_BG = colors.HexColor("#F7FAF7")

def generate_analysis_pdf(analysis: PlantAnalysis) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=PRIMARY_GREEN,
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=TEXT_MUTED,
        spaceAfter=15
    )
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        textColor=DARK_GREEN,
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=TEXT_DARK,
        leading=13
    )
    bullet_style = ParagraphStyle(
        'BulletDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=TEXT_DARK,
        leading=13,
        leftIndent=12,
        spaceAfter=3
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        textColor=TEXT_MUTED,
        leading=11
    )

    story = []

    # 1. Header
    story.append(Paragraph("🌿 PlantCare AI — Diagnostic Health Report", title_style))
    analysis_date = analysis.created_at.strftime("%B %d, %Y - %I:%M %p") if analysis.created_at else "Recent"
    story.append(Paragraph(f"Generated on {analysis_date} | Report Reference: #PC-{analysis.id:05d}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY_GREEN, spaceBefore=0, spaceAfter=15))

    # 2. Plant Summary Table
    plant_data = [
        [
            Paragraph("<b>Common Name:</b>", body_style),
            Paragraph(analysis.common_name or "Unidentified Plant", body_style),
            Paragraph("<b>Health Score:</b>", body_style),
            Paragraph(f"<b>{analysis.health_score}/100 ({analysis.health_status})</b>", body_style),
        ],
        [
            Paragraph("<b>Scientific Name:</b>", body_style),
            Paragraph(f"<i>{analysis.scientific_name or 'Unknown'}</i>", body_style),
            Paragraph("<b>Severity:</b>", body_style),
            Paragraph(analysis.severity or "None", body_style),
        ],
        [
            Paragraph("<b>Identification Match:</b>", body_style),
            Paragraph(f"{int(analysis.identification_confidence * 100)}%", body_style),
            Paragraph("<b>Follow-up Check:</b>", body_style),
            Paragraph(f"In {analysis.next_check_days} days", body_style),
        ]
    ]
    summary_table = Table(plant_data, colWidths=[120, 150, 110, 150])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), ACCENT_BG),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 12))

    # 3. Executive Analysis Summary
    if analysis.analysis_summary:
        story.append(Paragraph("Summary of Observations", h2_style))
        story.append(Paragraph(analysis.analysis_summary, body_style))
        story.append(Spacer(1, 10))

    # 4. Detected Issues
    if analysis.detected_issues:
        story.append(Paragraph("Detected Issues & Diagnostic Indicators", h2_style))
        for issue in analysis.detected_issues:
            issue_title = f"<b>• {issue.issue_name}</b>"
            if issue.possible_disease and issue.possible_disease.lower() != "none":
                issue_title += f" (Possible Disease: <i>{issue.possible_disease}</i>)"
            story.append(Paragraph(issue_title, body_style))
            
            if issue.observed_symptoms:
                story.append(Paragraph("<b>Observed Symptoms:</b>", bullet_style))
                for s in issue.observed_symptoms:
                    story.append(Paragraph(f"- {s}", bullet_style))
            
            if issue.possible_causes:
                story.append(Paragraph("<b>Possible Causes:</b>", bullet_style))
                for c in issue.possible_causes:
                    story.append(Paragraph(f"- {c}", bullet_style))
            story.append(Spacer(1, 6))

    # 5. Nutrient Assessment
    if analysis.nutrient_deficiencies or analysis.nutrient_observations:
        story.append(Paragraph("Nutrient Status & Soil Indicators", h2_style))
        if analysis.nutrient_deficiencies:
            defs = ", ".join(analysis.nutrient_deficiencies)
            story.append(Paragraph(f"<b>Possible Deficiencies Noted:</b> {defs}", body_style))
        if analysis.nutrient_observations:
            story.append(Paragraph(analysis.nutrient_observations, body_style))
        story.append(Spacer(1, 10))

    # 6. Treatment Recommendations
    if analysis.treatment_recommendations:
        treatment = analysis.treatment_recommendations[0]
        story.append(Paragraph("Recommended Treatment Actions", h2_style))
        
        if treatment.immediate_actions:
            story.append(Paragraph("<b>Immediate Actions:</b>", body_style))
            for act in treatment.immediate_actions:
                story.append(Paragraph(f"• {act}", bullet_style))
        
        if treatment.organic_treatments:
            story.append(Paragraph("<b>Organic & Natural Remedies:</b>", body_style))
            for org in treatment.organic_treatments:
                story.append(Paragraph(f"• {org}", bullet_style))

        if treatment.other_treatment_options:
            story.append(Paragraph("<b>Chemical / Conventional Considerations (Use with Caution):</b>", body_style))
            for chem in treatment.other_treatment_options:
                story.append(Paragraph(f"• {chem}", bullet_style))

        if treatment.preventive_measures:
            story.append(Paragraph("<b>Preventive Measures for Long-Term Health:</b>", body_style))
            for prev in treatment.preventive_measures:
                story.append(Paragraph(f"• {prev}", bullet_style))
        story.append(Spacer(1, 10))

    # 7. Plant Care Guide
    story.append(Paragraph("Routine Plant Care Guide", h2_style))
    care_data = [
        [Paragraph("<b>Watering</b>", body_style), Paragraph(analysis.watering_guide or "Maintain regular moisture", body_style)],
        [Paragraph("<b>Sunlight</b>", body_style), Paragraph(analysis.sunlight_guide or "Standard appropriate light", body_style)],
        [Paragraph("<b>Soil</b>", body_style), Paragraph(analysis.soil_guide or "Well-draining rich potting mix", body_style)],
        [Paragraph("<b>Fertilizer</b>", body_style), Paragraph(analysis.fertilizer_guide or "Balanced organic fertilizer", body_style)],
    ]
    care_table = Table(care_data, colWidths=[100, 430])
    care_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), LIGHT_GREEN),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(care_table)
    story.append(Spacer(1, 15))

    # 8. Disclaimer
    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceBefore=5, spaceAfter=8))
    story.append(Paragraph(
        "<b>Important Notice:</b> PlantCare AI utilizes Google Gemini Multimodal AI vision algorithms. "
        "Diagnostic scores and recommendations are indicative and educational assessments based on photographic symptoms, "
        "not certified laboratory or microscopic phytopathological assays. Before applying regulated chemical compounds or pesticides, "
        "always read manufacturer labels and follow local agricultural extension safety directives.",
        disclaimer_style
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer
