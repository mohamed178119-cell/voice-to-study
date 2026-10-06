import { createServerFn } from "@tanstack/react-start";

export type StudyAttachment = {
  kind: "image" | "pdf" | "audio";
  mime: string;
  /** base64 (بدون بادئة data:) */
  data: string;
  name?: string;
};

export type StudyInput = {
  prompt: string;
  mode?: "solve" | "summarize" | "explain";
  attachments?: StudyAttachment[];
  /** ذاكرة المحادثة السابقة */
  history?: { role: "user" | "assistant"; content: string }[];
};

const SYSTEM_PROMPT = `أنت "المساعد الدراسي" — مدرّس ذكي ومنضبط، تتحدث العربية الفصحى المبسطة.

قواعد صارمة:
1. لا تجيب إلا على ما يتعلق بالدراسة والمناهج والمواد التعليمية (شرح، حل مسائل، تلخيص، مراجعة، امتحانات، مهارات الدراسة).
2. أي سؤال خارج الدراسة (سياسة، رياضة، دردشة شخصية، أخبار، ترفيه...) ترفضه بلطف بجملة واحدة: "أنا مساعد دراسي فقط، اسألني في المنهج أو الدراسة وسأساعدك 👨‍🏫" ولا تضيف شيئًا آخر.
3. التزم بالضابط المدرسي: لغة محترمة، بلا إساءة أو محتوى غير لائق، وتشجيع للطالب.
4. رتّب الإجابة بعناوين ونقاط وخطوات مرقّمة، واكتب المعادلات بشكل واضح.
5. عند حل سؤال: اذكر المعطيات، ثم خطوات الحل، ثم الإجابة النهائية بشكل بارز.
6. عند التلخيص: أعطِ ملخصًا منظّمًا + أهم النقاط + أسئلة مراجعة سريعة.`;

const MODE_HINT: Record<string, string> = {
  solve: "حلّ كل الأسئلة الموجودة خطوة بخطوة مع الإجابة النهائية.",
  summarize: "لخّص المحتوى بشكل منظم واستخرج أهم النقاط وأسئلة مراجعة.",
  explain: "اشرح المحتوى ببساطة وبأمثلة.",
};

export const askStudyAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: StudyInput) => {
    if (!input || typeof input.prompt !== "string") throw new Error("طلب غير صالح");
    return input;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("خدمة الذكاء الاصطناعي غير مُهيّأة");

    const content: unknown[] = [];
    const hint = data.mode ? MODE_HINT[data.mode] : undefined;
    content.push({
      type: "text",
      text: [data.prompt || "", hint].filter(Boolean).join("\n\n") || "ساعدني في هذا المحتوى الدراسي.",
    });

    for (const att of data.attachments ?? []) {
      if (!att?.data) continue;
      if (att.kind === "image") {
        content.push({
          type: "image_url",
          image_url: { url: `data:${att.mime};base64,${att.data}` },
        });
      } else if (att.kind === "pdf") {
        content.push({
          type: "file",
          file: {
            filename: att.name || "document.pdf",
            file_data: `data:${att.mime};base64,${att.data}`,
          },
        });
      } else {
        const format = att.mime.includes("mp4") || att.mime.includes("m4a")
          ? "m4a"
          : att.mime.includes("mpeg") || att.mime.includes("mp3")
            ? "mp3"
            : att.mime.includes("wav")
              ? "wav"
              : att.mime.includes("ogg")
                ? "ogg"
                : "webm";
        content.push({ type: "input_audio", input_audio: { data: att.data, format } });
      }
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...(data.history ?? [])
            .filter((h) => (h.role === "user" || h.role === "assistant") && typeof h.content === "string")
            .slice(-10)
            .map((h) => ({ role: h.role, content: h.content.slice(0, 4000) })),
          { role: "user", content },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      if (res.status === 429) throw new Error("الطلبات كثيرة الآن، حاول بعد لحظات.");
      if (res.status === 402) throw new Error("انتهى رصيد الذكاء الاصطناعي، يرجى إضافة رصيد.");
      throw new Error(`تعذّر الحصول على الإجابة (${res.status}): ${detail.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    return { answer: text || "لم أتمكن من قراءة المحتوى، حاول برفع ملف أوضح." };
  });

/** توليد صورة ملخّص دراسية (سبورة/إنفوجرافيك) — للمواد الدراسية فقط */
export const generateStudyImage = createServerFn({ method: "POST" })
  .inputValidator((input: { topic: string }) => {
    if (!input || typeof input.topic !== "string" || !input.topic.trim())
      throw new Error("اكتب موضوع الدرس أولًا");
    return { topic: input.topic.trim().slice(0, 4000) };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("خدمة الذكاء الاصطناعي غير مُهيّأة");

    const headers = {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    };

    // بوابة: صور دراسية فقط
    const gate = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "صنّف النص: هل هو موضوع دراسي/تعليمي (مواد مدرسية أو جامعية، علوم، رياضيات، لغات، تاريخ، أحياء...)؟ أجب بحرف واحد فقط: 1 إذا كان دراسيًا، 0 إذا لم يكن.",
          },
          { role: "user", content: data.topic },
        ],
      }),
    });
    const gateJson = (await gate.json().catch(() => null)) as
      | { choices?: { message?: { content?: string } }[] }
      | null;
    const verdict = gateJson?.choices?.[0]?.message?.content ?? "1";
    if (!verdict.includes("1")) {
      throw new Error("أنا مساعد دراسي فقط، اطلب صورة لموضوع دراسي 👨‍🏫");
    }

    const imgPrompt = `صمّم صورة تعليمية عربية (إنفوجرافيك دراسي على شكل سبورة/ملصق مراجعة) تلخّص هذا الدرس:
"""${data.topic}"""
المطلوب: عنوان واضح بالأعلى، 4-6 نقاط رئيسية قصيرة بالعربية الفصحى، أيقونات ورسوم توضيحية بسيطة، أسهم ومخططات عند الحاجة، تصميم نظيف بألوان تعليمية هادئة (أخضر/تركواز/أبيض)، خط عربي واضح ومقروء جدًا وبلا أخطاء إملائية، بلا أي محتوى غير دراسي، اتجاه الكتابة من اليمين إلى اليسار.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image",
        messages: [{ role: "user", content: imgPrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      if (res.status === 429) throw new Error("الطلبات كثيرة الآن، حاول بعد لحظات.");
      if (res.status === 402) throw new Error("انتهى رصيد الذكاء الاصطناعي، يرجى إضافة رصيد.");
      throw new Error(`تعذّر إنشاء الصورة (${res.status}): ${detail.slice(0, 200)}`);
    }

    const imgJson = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = imgJson.data?.[0]?.b64_json;
    if (!b64) throw new Error("تعذّر إنشاء الصورة، حاول بصياغة أوضح للدرس.");
    return { image: `data:image/png;base64,${b64}` };
  });
