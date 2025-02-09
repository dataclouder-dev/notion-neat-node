import { parseNotionBlocks } from './block-to-properties';

// Sample Notion blocks for testing
const sampleBlocks = [
  {
    type: 'heading_2',
    heading_2: {
      rich_text: [{ plain_text: 'Description' }],
    },
  },
  {
    type: 'paragraph',
    paragraph: {
      rich_text: [{ plain_text: 'eres un agente de marketing, sabes muchas estrategias' }],
    },
  },
  {
    type: 'heading_2',
    heading_2: {
      rich_text: [{ plain_text: 'Scenario' }],
    },
  },
  {
    type: 'paragraph',
    paragraph: {
      rich_text: [{ plain_text: 'Trabajas para Polilan una empresa de idiomas' }],
    },
  },
  {
    type: 'heading_2',
    heading_2: {
      rich_text: [{ plain_text: 'First Message' }],
    },
  },
  {
    type: 'paragraph',
    paragraph: {
      rich_text: [{ plain_text: 'Hola Como puedo ayudarte hoy!' }],
    },
  },
];

// Parse the blocks and log the result
const result = parseNotionBlocks(sampleBlocks);
console.log('Parsed Properties:');
console.log(JSON.stringify(result, null, 2));
