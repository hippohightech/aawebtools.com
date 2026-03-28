import json
from google import genai
from app.config import settings

_client = genai.Client(api_key=settings.GOOGLE_API_KEY)
_MODEL = "gemini-2.5-flash"

SITE_INFO = f"""
Site: {settings.site.get('name', 'AAWebTools')}
URL: {settings.site.get('url', 'https://aawebtools.com')}
Description: {settings.site.get('description', '')}
Owner: {settings.site.get('owner', '')}
Company: {settings.site.get('company', '')}
"""


async def generate_directory_description(directory_name, max_words=150):
    prompt = f"""Write a unique product description for submitting to {directory_name}.
{SITE_INFO}
Tools offered: {', '.join(t['name'] for t in settings.tools)}

Requirements:
- {max_words} words max
- Professional tone, not salesy
- Mention it's free with no signup
- Unique angle (don't start with "AAWebTools is...")
- No emojis
Return only the description text."""

    response = _client.models.generate_content(model=_MODEL, contents=prompt)
    return response.text.strip()


async def generate_article(topic, target_platform, backlink_url, keywords=None):
    kw = ", ".join(keywords) if keywords else "free online tools"
    prompt = f"""Write an article for {target_platform} about: {topic}

{SITE_INFO}

Requirements:
- 800-1200 words
- Professional, helpful, not promotional
- Naturally include ONE link to {backlink_url} where it fits contextually
- Keywords to weave in naturally: {kw}
- Format for {target_platform} (use markdown if Dev.to/Hashnode, rich text style if Medium/LinkedIn)
- Include a compelling title
- No emojis in title

Return as JSON: {{"title": "...", "body": "..."}}"""

    response = _client.models.generate_content(model=_MODEL, contents=prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    return json.loads(text)


async def generate_outreach_email(recipient_name, recipient_site, context, email_type="resource_page"):
    prompts = {
        "resource_page": f"""Write a short outreach email asking {recipient_name} to add AAWebTools to their resource page at {recipient_site}.
Context: {context}
{SITE_INFO}
- Under 120 words
- Reference something specific on their page
- Explain what AAWebTools adds
- Professional, not pushy
- Sign as: {settings.site.get('owner', 'Karim')}
Return as JSON: {{"subject": "...", "body": "..."}}""",

        "guest_post": f"""Write a guest post pitch email to {recipient_name} at {recipient_site}.
{SITE_INFO}
- Under 150 words
- Propose 2-3 article ideas relevant to their audience
- Mention your expertise (building free web tools)
- Professional, personalized
- Sign as: {settings.site.get('owner', 'Karim')}
Return as JSON: {{"subject": "...", "body": "..."}}""",

        "broken_link": f"""Write a broken link outreach email to {recipient_name} at {recipient_site}.
Context: {context}
{SITE_INFO}
- Under 100 words
- Mention the broken link you found
- Suggest AAWebTools as a working replacement
- Helpful tone, not salesy
- Sign as: {settings.site.get('owner', 'Karim')}
Return as JSON: {{"subject": "...", "body": "..."}}""",
    }

    prompt = prompts.get(email_type, prompts["resource_page"])
    response = _client.models.generate_content(model=_MODEL, contents=prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    return json.loads(text)


async def generate_haro_response(query, expertise_area="free online tools"):
    prompt = f"""A journalist is asking: "{query}"

Draft an expert response from the perspective of:
{SITE_INFO}

Requirements:
- 150-250 words
- Include a specific data point or insight
- Naturally mention a relevant tool from AAWebTools where appropriate
- Sound like a real expert, not AI-generated
- Sign off: {settings.site.get('owner', 'Karim Narimi')}, Founder of AAWebTools (aawebtools.com)

Return only the response text."""

    response = _client.models.generate_content(model=_MODEL, contents=prompt)
    return response.text.strip()


async def generate_social_bookmark(url, tool_name):
    prompt = f"""Write a social bookmark entry for {tool_name}.
URL: {url}
{SITE_INFO}
- Title: catchy, under 60 characters
- Description: 1-2 sentences, under 160 characters
- No emojis
Return as JSON: {{"title": "...", "description": "..."}}"""

    response = _client.models.generate_content(model=_MODEL, contents=prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0]
    return json.loads(text)
