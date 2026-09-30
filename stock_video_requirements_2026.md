# Stock Video Platform Submission Requirements - 2026 Comparison

## Platform Technical Requirements Comparison

| Requirement | Shutterstock | Adobe Stock | Getty Images / iStock | Depositphotos |
|-------------|-------------|-------------|----------------------|---------------|
| **Formats** | QuickTime .mov, .mp4 | MOV, MPG, MP4 | MOV, MP4 | MOV, MP4 |
| **Min Resolution** | 640×480 (SD) | 1920×1080 (HD) | 1920×1080 (HD) | 1920×1080 (HD) |
| **Max Resolution** | 4800×2700 (4K+) | 4096×2304 (4K) | 4096×2160 (4K) | 4096×2160 (4K) |
| **HD Accepted** | Yes (1280×720, 1920×1080) | Yes (1920×1080) | Yes (1920×1080) | Yes (1920×1080) |
| **4K Accepted** | Yes (3840×2160, 4096×2160, etc.) | Yes (3840×2160, 4096×2160, 4096×2304) | Yes (3840×2160, 4096×2160) | Yes (3840×2160, 4096×2160) |
| **Aspect Ratios** | 16:9, 4:3, 1:1, 9:16 (vertical) | 16:9, 9:16, 1:1, 2.39:1, 3:2, 4:3 | 16:9, 9:16, 1:1, 4:3 | 16:9, 9:16, 1:1, 4:3 |
| **Codecs** | PhotoJPEG, ProRes 422/HQ/4444/LT, H.264, H.265*, PNG, MPEG-4 Visual, Apple Animation (RLE) | ProRes, H.264 (recommended), MPEG-2, MPEG-4, Motion JPEG, PNG | H.264, ProRes, DNxHD, DNxHR | H.264, H.265, ProRes, DNxHD |
| **Frame Rates** | 23.98, 24, 25, 29.97, 30, 48, 50, 59.94, 60 | 23.98, 24, 25, 29.97, 30, 50, 59.94, 60 | 23.98, 24, 25, 29.97, 30, 50, 59.94, 60 | 23.98, 24, 25, 29.97, 30, 50, 59.94, 60 |
| **Min Duration** | 5 seconds | 5 seconds | 5 seconds | 5 seconds |
| **Max Duration** | 60 seconds | 60 seconds | 60 seconds | 60 seconds |
| **Max File Size** | 10 GB | 3.9 GB | 2 GB | 2 GB |
| **Bitrate** | No specific requirement (use best quality) | No specific requirement | No specific requirement | No specific requirement |
| **Audio** | Optional; should enhance clip or be editorial | Optional; silent preferred | Optional; clean audio preferred | Optional; silent preferred |
| **Color Space** | REC 709 preferred | No specific requirement | Rec. 709 preferred | No specific requirement |
| **AI-Generated Content** | ✅ Accepted | ✅ Accepted | ✅ Accepted | ✅ Accepted |
| **AI Disclosure** | Required | Required ("Created using generative AI") | Required | Required |
| **Metadata** | Title, keywords, category, releases | Title, keywords, category, releases | Title, keywords, category, releases | Title, keywords, category, releases |

*\*H.265 accepted but not recommended due to HDR compatibility issues*

---

## Grok API (xAI) Video Generation Specs

| Parameter | Specification |
|-----------|---------------|
| **Model** | grok-imagine-video |
| **Duration** | 1-15 seconds |
| **Aspect Ratios** | 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3 |
| **Resolutions** | 480p (default), 720p, 1080p* |
| **Output Format** | MP4 |
| **Workflows** | Text-to-video, Image-to-video, Reference-to-video, Edit-video, Extend-video |

*\*1080p only available on grok-imagine-video-1.5 for image-to-video generation*

---

## Kling AI Video Generation Specs

| Parameter | Specification |
|-----------|---------------|
| **Models** | Kling 3.0, Video 3.0 Omni |
| **Duration** | 5-10 seconds (varies by plan) |
| **Aspect Ratios** | 16:9, 9:16, 1:1 |
| **Resolutions** | Up to 4K (native 4K on 3.0) |
| **Output Format** | MP4 |
| **Frame Rate** | 24-60 fps |

---

## AI-Generated Video on Stock Platforms - Legal Considerations

### Can AI-Generated Video Be Sold Legally?

**Yes, with conditions:**

| Platform | AI Policy | Requirements |
|----------|-----------|--------------|
| **Shutterstock** | Accepted | Must disclose as AI-generated; must own rights per AI tool's ToS |
| **Adobe Stock** | Accepted | Must mark as "Created using generative AI"; must have commercial rights; no artist style replication |
| **Getty Images/iStock** | Accepted | Must disclose as AI-generated; must have commercial rights |
| **Depositphotos** | Accepted | Must disclose as AI-generated; must have commercial rights |

### Key Legal Requirements:

1. **Commercial Rights**: You must have the right to sell the content commercially per the AI tool's Terms of Service
2. **Disclosure**: All platforms require disclosure that content is AI-generated
3. **No Copyright Infringement**: Cannot replicate specific artists' styles or use prompts referencing copyrighted IP
4. **No Real People**: Cannot generate content depicting real, identifiable people without consent
5. **No Trademarks**: Cannot include trademarks or logos without permission

### Platform-Specific AI Policies:

- **Adobe Stock**: Has dedicated "Generative AI Premium Collection" with higher quality standards
- **Getty Images**: Created partnership with NVIDIA for ethical AI content generation
- **Shutterstock**: Uses their own AI tools (DALL-E integration) and accepts third-party AI content

---

## Standard FPS for AI-Generated Video

| AI Tool | Default FPS | Notes |
|---------|-------------|-------|
| **Grok (xAI)** | Not specified (likely 24-30fps) | Output is MP4, duration 1-15s |
| **Kling AI** | 24-60 fps | Configurable, up to 60fps |
| **Runway Gen-3** | 24 fps | Standard cinematic frame rate |
| **Pika Labs** | 24 fps | Default output |
| **Sora (OpenAI)** | 24 fps | Cinematic standard |

**Most AI video generators default to 24fps**, which is the standard cinematic frame rate and is accepted by all major stock platforms.

---

## Quick Reference: Submission Checklist

### Before Submitting:

- [ ] Video meets minimum resolution (1920×1080 HD for most platforms)
- [ ] Format is .mov or .mp4
- [ ] Codec is H.264 or ProRes (recommended)
- [ ] Duration is 5-60 seconds
- [ ] Frame rate is 23.98, 24, 25, 29.97, or 30 fps
- [ ] File size is under platform limit
- [ ] AI-generated content is properly disclosed
- [ ] No copyrighted material without releases
- [ ] No trademarks or logos without permission
- [ ] Metadata prepared (title, keywords, category)

### Platform-Specific Limits:

| Platform | Max File Size | Min Duration | Max Duration |
|----------|---------------|--------------|--------------|
| Shutterstock | 10 GB | 5s | 60s |
| Adobe Stock | 3.9 GB | 5s | 60s |
| Getty/iStock | 2 GB | 5s | 60s |
| Depositphotos | 2 GB | 5s | 60s |

---

## Sources

- Shutterstock Contributor Support: https://submit.shutterstock.com/help/en/articles/10594637-what-are-the-technical-requirements-for-video
- Adobe Stock Contributor: https://helpx.adobe.com/stock/contributor/submit-your-content/submit-videos/technical-requirements-for-video-submissions.html
- xAI (Grok) Documentation: https://docs.x.ai/developers/model-capabilities/video/generation
- Kling AI: https://klingai.com

*Last updated: July 2026*
