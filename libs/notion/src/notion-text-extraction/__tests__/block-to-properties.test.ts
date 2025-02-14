import { parseNotionBlocks } from '../block-to-properties';

describe('parseNotionBlocks', () => {
  it('should parse heading_2 blocks and their following paragraphs correctly', () => {
    const mockBlocks = [
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ plain_text: 'Description' }],
        },
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{ plain_text: 'This is a description text' }],
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
          rich_text: [{ plain_text: 'This is a scenario text' }],
        },
      },
    ];

    const expected = {
      Description: 'This is a description text',
      Scenario: 'This is a scenario text',
    };

    expect(parseNotionBlocks(mockBlocks)).toEqual(expected);
  });

  it('should handle empty paragraphs and missing rich_text', () => {
    const mockBlocks = [
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ plain_text: 'Empty Paragraph Test' }],
        },
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [],
        },
      },
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [{ plain_text: 'Valid Heading' }],
        },
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{ plain_text: 'Valid text' }],
        },
      },
    ];

    const expected = {
      'Valid Heading': 'Valid text',
    };

    expect(parseNotionBlocks(mockBlocks)).toEqual(expected);
  });

  it('should handle blocks without headings', () => {
    const mockBlocks = [
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{ plain_text: 'Just a paragraph' }],
        },
      },
      {
        type: 'divider',
        divider: {},
      },
    ];

    expect(parseNotionBlocks(mockBlocks)).toEqual({});
  });
});
