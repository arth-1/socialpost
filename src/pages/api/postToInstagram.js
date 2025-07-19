import { IgApiClient } from 'instagram-private-api';
import request from 'request-promise';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageUrl, caption, instaUser, instaPass } = req.body;
  const username = instaUser && instaUser.trim() ? instaUser : process.env.IG_USERNAME;
  const password = instaPass && instaPass.trim() ? instaPass : process.env.IG_PASSWORD;

  if (!imageUrl || !caption) {
    return res.status(400).json({ error: 'Missing image or caption' });
  }

  try {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    await ig.simulate.preLoginFlow();
    await ig.account.login(username, password);
    process.nextTick(() => ig.simulate.postLoginFlow());

    let imageBuffer;
    if (imageUrl.startsWith('data:')) {
      // Handle data URI (base64)
      const matches = imageUrl.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid data URI');
      }
      imageBuffer = Buffer.from(matches[2], 'base64');
    } else {
      // Handle remote URL
      imageBuffer = await request({
        url: imageUrl,
        encoding: null,
      });
    }

    const result = await ig.publish.photo({
      file: imageBuffer,
      caption,
    });

    return res.status(200).json({ success: true, mediaId: result.media.id });
  } catch (err) {
    console.error('Error posting to Instagram:', err);
    return res.status(500).json({ error: 'Failed to post to Instagram' });
  }
}
