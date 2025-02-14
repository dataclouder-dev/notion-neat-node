interface NotionBlock {
  type: string;
  heading_2?: {
    rich_text: Array<{
      plain_text: string;
    }>;
  };
  paragraph?: {
    rich_text: Array<{
      plain_text: string;
    }>;
  };
}

export function parseNotionBlocks(blocks: NotionBlock[]): Record<string, string> {
  const properties: Record<string, string> = {};
  let currentHeading: string | null = null;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // If we find a heading_2, store its text
    if (block.type === 'heading_2') {
      currentHeading = block.heading_2?.rich_text[0]?.plain_text || '';
    }
    // If we have a current heading and this is a paragraph, store its text
    else if (currentHeading && block.type === 'paragraph') {
      const paragraphText = block.paragraph?.rich_text[0]?.plain_text || '';
      if (paragraphText) {
        // Only add if there's actual text content
        properties[currentHeading] = paragraphText;
        currentHeading = null; // Reset current heading
      }
    }
  }

  return properties;
}
