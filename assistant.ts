import OpenAI from 'openai';
const openai = new OpenAI();

// The assistant API requires 3 pillars - an assistant, a thread, and a runtime

// Create an assistant, provide them a name, role and tools they can use to assist

const assistant = await openai.beta.assistants.create({
  name: 'Senior Software Engineer Assistant',
  instructions: 'You are a senior AI engineer, you are here to help a senior engineer develop AI features into web applications. Advise on the best practises and most up to date tools to use.',
  tools: [{ type: "code_interpreter" }],
  model: 'gpt-4o'
})

// Create a thread, which serves as the context for the conversation
const thread = await openai.beta.threads.create();

// Create a message, which is the input to the assistant.
const message = await openai.beta.threads.messages.create(
  thread.id,
  {
    role: 'user',
    content: 'I need help learning the basic use of OpenAI APIs for different applications. I am an experienced full stack developer working on web apps, but new to AI development. Can you help me?'
  })



// Create a Run
const run = openai.beta.threads.runs.stream(thread.id, {
  assistant_id: assistant.id,
})
  .on('textCreated', (text) => process.stdout.write('\nassistant > '))
  .on('textDelta', (textDelta, snapshot) => process.stdout.write(textDelta.value ?? ''))
  .on('toolCallCreated', (toolCall) => process.stdout.write(`\nassistant > ${toolCall.type}\n\n`))
  .on('toolCallDelta', (toolCallDelta, snapshot) => {
    if (toolCallDelta.type === 'code_interpreter') {
      if (toolCallDelta.code_interpreter?.input) {
        process.stdout.write(toolCallDelta.code_interpreter.input)
      }
      if (toolCallDelta.code_interpreter?.outputs) {
        process.stdout.write("\noutput >\n")
      } toolCallDelta.code_interpreter?.outputs?.forEach(output => {
        if (output.type === 'logs') {
          process.stdout.write(`\n${output.logs}\n`)
        }
      })
    }
  })