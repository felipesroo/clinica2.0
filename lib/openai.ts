import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
// In-memory conversation history (For production, move this to the database)
const conversationMemory = new Map<string, OpenAI.Chat.ChatCompletionMessageParam[]>();

export async function processMessageWithAI(phone: string, text: string): Promise<string | null> {
  const settings = await prisma.configuracao.findFirst();
  
  if (!settings || !settings.aiAgentActive || !settings.openAiApiKey) {
    return null; // AI is off or not configured
  }

  const openai = new OpenAI({
    apiKey: settings.openAiApiKey,
  });

  // Initialize history for this phone if not exists
  if (!conversationMemory.has(phone)) {
    conversationMemory.set(phone, [
      {
        role: "system",
        content: settings.openAiSystemPrompt || "Você é uma assistente virtual de uma clínica. Responda de forma educada e concisa."
      }
    ]);
  }

  const history = conversationMemory.get(phone)!;
  
  // Add user message to history
  history.push({ role: "user", content: text });

  // Define tools if auto-schedule is on, else no tools (just chat)
  const tools: OpenAI.Chat.ChatCompletionTool[] = settings.aiAutoSchedule ? [
    {
      type: "function",
      function: {
        name: "get_available_slots",
        description: "Obter horários disponíveis na agenda para uma data específica.",
        parameters: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "A data no formato YYYY-MM-DD"
            }
          },
          required: ["date"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "book_appointment",
        description: "Criar um agendamento para o paciente.",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string", description: "Data no formato YYYY-MM-DD" },
            time: { type: "string", description: "Horário no formato HH:MM" },
            service: { type: "string", description: "Nome do procedimento" },
            patientName: { type: "string", description: "Nome completo do paciente" }
          },
          required: ["date", "time", "service", "patientName"]
        }
      }
    }
  ] : [];

  try {
    let response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use GPT-4o-mini for speed and cost
      messages: history,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? "auto" : undefined,
    });

    let message = response.choices[0].message;

    // Handle tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      history.push(message); // add assistant message with tool_calls
      
      for (const toolCall of message.tool_calls as any[]) {
        let contentToPush = "";
        try {
          const args = JSON.parse(toolCall.function?.arguments || "{}");
          if (toolCall.function?.name === "get_available_slots") {
            const slots = await getAvailableSlots(args.date);
            contentToPush = JSON.stringify(slots);
          } else if (toolCall.function?.name === "book_appointment") {
            const result = await bookAppointment(args, phone);
            contentToPush = JSON.stringify(result);
          } else {
            contentToPush = JSON.stringify({ error: "Unknown tool call" });
          }
        } catch (e: any) {
          contentToPush = JSON.stringify({ error: "Failed to parse arguments or execute tool" });
        }

        history.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: contentToPush
        });
      }

      // Get final response after tool execution
      response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: history,
      });
      message = response.choices[0].message;
    }

    if (message.content) {
      history.push({ role: "assistant", content: message.content });
      return message.content;
    }
    
    return null;

  } catch (error) {
    console.error("OpenAI AI Error:", error);
    if (error instanceof Error) {
      console.error("OpenAI Stack Trace:", error.stack);
    } else {
      console.error("OpenAI Unknown Error format:", JSON.stringify(error));
    }
    return "Desculpe, estou passando por uma instabilidade no meu sistema de IA no momento. Por favor, tente novamente mais tarde.";
  }
}

// --- Tool Implementations ---

async function getAvailableSlots(date: string) {
  // Simple mock logic: return all hours from 09:00 to 18:00 that are NOT booked
  const agendamentos = await prisma.agendamento.findMany({
    where: { date }
  });

  const bookedTimes = agendamentos.map(a => a.startTime);
  const allTimes = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  
  const available = allTimes.filter(t => !bookedTimes.includes(t));
  return { date, available_slots: available };
}

import { findOrCreateClient } from '@/app/actions/client';

async function bookAppointment(args: any, phone: string) {
  try {
    // 1. Find or create patient cleanly
    const paciente = await findOrCreateClient({
      nome: args.patientName,
      telefone: phone,
    });

    // 2. Create appointment
    const appointment = await prisma.agendamento.create({
      data: {
        date: args.date,
        startTime: args.time,
        duration: 60,
        service: args.service,
        status: "Agendado",
        cliente: { connect: { id: paciente.id } }
      }
    });

    return { success: true, message: "Agendamento criado com sucesso!", appointment_id: appointment.id };
  } catch (error: any) {
    console.error("Erro ao agendar via IA:", error);
    return { success: false, error: error.message };
  }
}
