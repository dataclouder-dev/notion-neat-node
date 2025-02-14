import { NotionDBPage } from '../models/classes';
import { SimpleBlock } from '../services/notion.service';

export function transformPropertyKeys(properties: Record<string, string>): Record<string, string> {
  const transformedProperties: Record<string, string> = {};

  for (const [key, value] of Object.entries(properties)) {
    // Check if there's a key in parentheses
    const match = key.match(/\((.*?)\)/);
    // If there's a match, use the text in parentheses, otherwise use the original key splitting logic
    const newKey = match ? match[1].trim() : key.split('-').pop()?.trim() || key;

    transformedProperties[newKey] = value;
  }

  return transformedProperties;
}

export function renderPageContentToHtml(blocks: SimpleBlock[], title: string): string {
  if (!blocks) {
    return 'Invalid page data';
  }

  let htmlContent = `<h1>${title}</h1>`;

  blocks.forEach(block => {
    switch (block.type) {
      case 'heading_1':
        htmlContent += `<h1>${block.content}</h1>`;
        break;
      case 'heading_2':
        htmlContent += `<h2>${block.content}</h2>`;
        break;
      case 'heading_3':
        htmlContent += `<h3>${block.content}</h3>`;
        break;
      case 'paragraph':
        if (block.content) {
          htmlContent += `<p>${block.content}</p>`;
        } else {
          htmlContent += `<br>`;
        }
        break;
      case 'bulleted_list_item':
        htmlContent += `<ul><li>${block.content}</li></ul>`;
        break;
      case 'image':
        htmlContent += `<div class="image-placeholder">[Image]</div>`;
        break;
      default:
        if (block.content) {
          htmlContent += `<p>${block.content}</p>`;
        }
    }
  });

  return htmlContent;
}

export function renderPageContentToMarkdown(blocks: SimpleBlock[], title: string): string {
  if (!blocks) {
    return 'Invalid page data';
  }

  let markdownContent = `# ${title}\n\n`;

  blocks.forEach(block => {
    switch (block.type) {
      case 'heading_1':
        markdownContent += `# ${block.content}\n\n`;
        break;
      case 'heading_2':
        markdownContent += `## ${block.content}\n\n`;
        break;
      case 'heading_3':
        markdownContent += `### ${block.content}\n\n`;
        break;
      case 'paragraph':
        if (block.content) {
          markdownContent += `${block.content}\n\n`;
        } else {
          markdownContent += `\n`;
        }
        break;
      case 'bulleted_list_item':
        markdownContent += `* ${block.content}\n`;
        break;
      case 'image':
        markdownContent += `![Image Placeholder]\n\n`;
        break;
      default:
        if (block.content) {
          markdownContent += `${block.content}\n\n`;
        }
    }
  });

  return markdownContent;
}

export function extractPagePlainText(blocks: SimpleBlock[], title: string): string {
  if (!blocks) {
    return 'Invalid page data';
  }

  let plainText = `${title}\n\n`;

  blocks.forEach(block => {
    if (block.content) {
      plainText += `${block.content}\n`;
    }
  });

  return plainText.trim();
}
