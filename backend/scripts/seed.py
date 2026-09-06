import json
from datetime import datetime, timedelta
from app.database import Base, engine, SessionLocal
from app.models import User, Lead, Qualification, GeneratedEmail
from app.security import hash_password

Base.metadata.create_all(engine)
db = SessionLocal()

user = db.query(User).filter_by(email="demo@leadpilot.dev").first()
if not user:
    user = User(
        email="demo@leadpilot.dev",
        name="Rudraksh Singh",
        password_hash=hash_password("LeadPilot123!"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print("Created demo user: demo@leadpilot.dev / LeadPilot123!")
else:
    user.name = "Rudraksh Singh"
    user.password_hash = hash_password("LeadPilot123!")
    db.commit()
    print("Updated demo user: demo@leadpilot.dev / LeadPilot123!")

sample_leads = [
    {
        "first_name": "John",
        "last_name": "Carter",
        "email": "john.carter@acmetech.io",
        "company": "Acme Technologies",
        "job_title": "VP of Sales",
        "industry": "SaaS",
        "company_size": "51 - 200",
        "website": "https://acmetech.io",
        "location": "San Francisco, USA",
        "notes": "Looking to automate outbound SDR pipeline and improve rep quota attainment.",
        "score": 88,
        "status": "qualified",
        "reasoning": "Executive decision-maker (VP of Sales) in target SaaS mid-market segment with clear buying intent for SDR automation.",
        "signals": [
            "Decision-maker role with budget authority",
            "Target SaaS vertical",
            "Company size matches 51-200 ICP",
            "Expressed direct need for pipeline automation",
        ],
        "email_subject": "Accelerating Acme Technologies' SDR Pipeline with AI",
        "email_body": "Hi John,\n\nI noticed your recent expansion in the B2B SaaS space and saw that Acme Technologies is aggressively scaling outbound efforts. Given your leadership as VP of Sales, having your reps spend more time in meetings and less time writing manual prospecting emails is likely a top priority.\n\nLeadPilot helps sales leaders automate personalized qualification and initial outreach drafts, improving outbound velocity by 35%.\n\nWould you be open to a brief 10-minute introductory call next Tuesday at 2:00 PM?\n\nBest regards,\nRudraksh Singh\nLeadPilot",
        "email_purpose": "Introduction / Outreach",
        "email_tone": "Professional",
    },
    {
        "first_name": "Sarah",
        "last_name": "Miller",
        "email": "sarah.m@novapay.co",
        "company": "NovaPay Solutions",
        "job_title": "Head of Growth",
        "industry": "Fintech",
        "company_size": "201 - 500",
        "website": "https://novapay.co",
        "location": "New York, USA",
        "notes": "Evaluating growth infrastructure for international payments launch.",
        "score": 76,
        "status": "review",
        "reasoning": "Strong departmental head in high-growth fintech vertical. Need to confirm specific SDR tool procurement authority.",
        "signals": [
            "Department leadership role",
            "Fintech industry vertical",
            "Series B funded growth stage",
            "May require VP Sales co-sign",
        ],
        "email_subject": "Scaling NovaPay's Merchant Acquisition Pipeline",
        "email_body": "Hi Sarah,\n\nCongratulations on NovaPay's upcoming international payments launch! As Head of Growth, coordinating rapid outbound acquisition while maintaining tailored messaging across diverse merchant verticals can be challenging.\n\nWe would love to share how modern AI SDR tools streamline account qualification and draft customized pitches in seconds.\n\nAre you available for a quick chat later this week?\n\nBest,\nRudraksh Singh",
        "email_purpose": "Follow-up",
        "email_tone": "Persuasive",
    },
    {
        "first_name": "Elena",
        "last_name": "Rostova",
        "email": "elena.r@healthpulse.ai",
        "company": "HealthPulse AI",
        "job_title": "Chief Commercial Officer",
        "industry": "Healthcare",
        "company_size": "51 - 200",
        "website": "https://healthpulse.ai",
        "location": "Boston, USA",
        "notes": "Scaling health tech provider partnerships across North America.",
        "score": 92,
        "status": "qualified",
        "reasoning": "Top-tier C-suite commercial stakeholder in health-tech AI vertical with high alignment to enterprise sales tech.",
        "signals": [
            "CCO role - direct executive authority",
            "Healthcare AI niche alignment",
            "Active provider outreach program",
            "High growth enterprise profile",
        ],
        "email_subject": "Partnership Outreach Automation for HealthPulse AI",
        "email_body": "Hi Elena,\n\nI have been closely tracking HealthPulse AI's advancements in provider intelligence. As CCO, driving partner engagement with healthcare networks requires a precision-driven approach to messaging.\n\nLeadPilot enables commercial teams to craft clinical and institutional outreach drafts that strictly reflect verified prospect credentials.\n\nCould we connect for 15 minutes this Thursday to walk through a quick workflow?\n\nWarm regards,\nRudraksh Singh",
        "email_purpose": "Meeting Request",
        "email_tone": "Professional",
    },
    {
        "first_name": "David",
        "last_name": "Kowalski",
        "email": "david.k@orbitlogic.io",
        "company": "Orbit Logic",
        "job_title": "Software Engineer",
        "industry": "EdTech",
        "company_size": "11 - 50",
        "website": "https://orbitlogic.io",
        "location": "Austin, USA",
        "notes": "Downloaded technical whitepaper on AI APIs.",
        "score": 38,
        "status": "unqualified",
        "reasoning": "Individual contributor software developer without budget authority or sales responsibility.",
        "signals": [
            "Individual contributor engineering title",
            "No sales or executive purchasing scope",
            "Early stage small business profile",
        ],
        "email_subject": "Technical Resources for Orbit Logic",
        "email_body": "Hi David,\n\nThanks for exploring our AI integration whitepaper. If you have any developer questions about our API architecture, feel free to reply directly to this thread.\n\nBest,\nRudraksh",
        "email_purpose": "Outreach",
        "email_tone": "Concise",
    },
    {
        "first_name": "Marcus",
        "last_name": "Vance",
        "email": "m.vance@apexlogistics.com",
        "company": "Apex Freight Logistics",
        "job_title": "Director of Business Development",
        "industry": "E-commerce",
        "company_size": "501 - 1000",
        "website": "https://apexlogistics.com",
        "location": "Chicago, USA",
        "notes": "Inquiring about automating cold supplier outreach.",
        "score": 82,
        "status": "qualified",
        "reasoning": "Director of BD managing outbound supplier relations at scale. High volume lead matching our enterprise ICP.",
        "signals": [
            "Director of BD title",
            "High volume outbound requirements",
            "Enterprise scale (500+ employees)",
            "Commercial workflow fit",
        ],
        "email_subject": "Streamlining Supplier Outbound at Apex Freight",
        "email_body": "Hi Marcus,\n\nGiven the scale of Apex Freight's supply chain operations, outbound BD teams often lose valuable hours manually researching prospects.\n\nLeadPilot automates qualification scoring and drafts tailored supplier propositions in seconds.\n\nWould you have 10 minutes next Wednesday morning for a quick demo?\n\nBest regards,\nRudraksh Singh",
        "email_purpose": "Product Demo",
        "email_tone": "Professional",
    },
]

for item in sample_leads:
    existing_lead = db.query(Lead).filter_by(owner_id=user.id, email=item["email"]).first()
    if not existing_lead:
        new_lead = Lead(
            owner_id=user.id,
            first_name=item["first_name"],
            last_name=item["last_name"],
            email=item["email"],
            company=item["company"],
            job_title=item["job_title"],
            industry=item["industry"],
            company_size=item["company_size"],
            website=item["website"],
            location=item["location"],
            notes=item["notes"],
            created_at=datetime.utcnow() - timedelta(days=len(sample_leads)),
        )
        db.add(new_lead)
        db.commit()
        db.refresh(new_lead)

        # Add qualification record
        q = Qualification(
            lead_id=new_lead.id,
            score=item["score"],
            status=item["status"],
            reasoning=item["reasoning"],
            signals=json.dumps(item["signals"]),
            analyzed_at=datetime.utcnow() - timedelta(hours=4),
        )
        db.add(q)

        # Add generated email record
        em = GeneratedEmail(
            lead_id=new_lead.id,
            subject=item["email_subject"],
            body=item["email_body"],
            purpose=item["email_purpose"],
            tone=item["email_tone"],
            status="generated",
            created_at=datetime.utcnow() - timedelta(hours=2),
        )
        db.add(em)
        db.commit()
        print(f"Seeded lead: {new_lead.first_name} {new_lead.last_name} ({new_lead.company})")

db.close()
print("Seeding completed successfully!")
