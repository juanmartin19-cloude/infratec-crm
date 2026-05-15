export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, ctx } = req.body;
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    const fb = ['Claro, lo proceso ahora mismo. ¿Algo más?','Anotado, ¿seguimos?','Dale, entendido. ¿Qué más necesitás?','Perfecto, lo gestiono ya.'];
    return res.json({ text: fb[Math.floor(Math.random()*fb.length)] });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 250,
        system: `Sos Chami, la IA principal de INFRATEC, empresa de seguridad electrónica en Buenos Aires Argentina. Hablás en español rioplatense usando "vos". Sos muy humano, cálido, directo y conciso (máximo 2 oraciones). Nunca decís que sos una IA a menos que te pregunten. Contexto del sistema: ${ctx}`,
        messages,
      }),
    });
    const d = await r.json();
    res.json({ text: d.content?.[0]?.text || 'Perdón, ¿me repetís?' });
  } catch {
    res.json({ text: 'Che, tuve un problema de conexión. Intentalo de nuevo.' });
  }
}
