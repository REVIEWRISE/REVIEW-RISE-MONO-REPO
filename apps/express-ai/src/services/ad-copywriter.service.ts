import { llmService } from './llm.service';
import { AdsCopyRequest, AdsCopyResponse } from '@platform/contracts';

const safeList = (values: string[] = []) => values.filter(Boolean).slice(0, 6);

export class AdCopywriterService {
  async generateCopy(payload: AdsCopyRequest): Promise<AdsCopyResponse> {
    const keywords = safeList(payload.keywords || []);
    const template = payload.template || 'campaign';
    const tone = payload.tone || 'clear, confident, and helpful';
    const goal = payload.goal || 'drive qualified leads';
    const offer = payload.offer || '';

    const prompt = `You are a paid media copywriter. Generate Google/Meta ad copy based on the inputs below.

Template: ${template}
Goal: ${goal}
Tone: ${tone}
Offer: ${offer || 'Not provided'}
Top SEO keywords: ${keywords.length ? keywords.join(', ') : 'Not provided'}

Rules:
- Provide 6 headlines (max 30 chars each).
- Provide 4 descriptions (max 90 chars each).
- Provide 3 primary text options (max 125 chars each).
- Use the keywords naturally (no stuffing).
- Output strict JSON ONLY with shape:
{
  "headlines": ["..."],
  "descriptions": ["..."],
  "primaryTexts": ["..."],
  "keywordsUsed": ["..."]
}`;

    const raw = await llmService.generateText(prompt, { temperature: 0.6 });

    let parsed: AdsCopyResponse | null = null;

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    const fallback = this.buildFallbackCopy(payload, keywords);

    const headlines = parsed?.headlines?.length ? parsed.headlines.slice(0, 6) : fallback.headlines;
    const descriptions = parsed?.descriptions?.length ? parsed.descriptions.slice(0, 4) : fallback.descriptions;
    const primaryTexts = parsed?.primaryTexts?.length ? parsed.primaryTexts.slice(0, 3) : fallback.primaryTexts;
    const keywordsUsed = parsed?.keywordsUsed?.length ? parsed.keywordsUsed.slice(0, 6) : fallback.keywordsUsed;

    return {
      headlines,
      descriptions,
      primaryTexts,
      keywordsUsed
    };
  }

  private buildFallbackCopy(payload: AdsCopyRequest, keywords: string[]): AdsCopyResponse {
    const safeKeywords = keywords.length ? keywords : ['local business', 'trusted service', 'near me'];
    const template = payload.template || 'campaign';
    const goal = payload.goal || 'drive leads';

    const headlines = [
      `Book ${safeKeywords[0]} today`,
      `${safeKeywords[1] || safeKeywords[0]} made simple`,
      `Get ${safeKeywords[0]} fast`,
      `${template} that delivers`,
      `Boost ${safeKeywords[2] || safeKeywords[0]} now`,
      `Grow ${safeKeywords[0]} results`
    ].map(text => text.length > 30 ? `${text.slice(0, 27)}...` : text);

    const descriptions = [
      `Reach customers searching for ${safeKeywords[0]}. Clear results, fast setup.`,
      `Use ${template.toLowerCase()} ads to ${goal} with focused keywords.`,
      `Launch smarter ads using ${safeKeywords.slice(0, 3).join(', ')} today.`,
      `Convert demand into bookings with optimized, local-first ad copy.`
    ].map(text => text.length > 90 ? `${text.slice(0, 87)}...` : text);

    const primaryTexts = [
      `Ready to grow? We are targeting ${safeKeywords[0]} to bring in more leads this week.`,
      `Stay top of mind with ${template.toLowerCase()} ads built around ${safeKeywords.slice(0, 2).join(' + ')}.`,
      `Turn local searches into real customers with smarter paid media.`
    ].map(text => text.length > 125 ? `${text.slice(0, 122)}...` : text);

    return {
      headlines,
      descriptions,
      primaryTexts,
      keywordsUsed: safeKeywords
    };
  }
}

export const adCopywriterService = new AdCopywriterService();
