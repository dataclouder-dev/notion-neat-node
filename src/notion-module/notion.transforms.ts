import { NotionDBPage } from './models/classes';

export function renderPageContentToHtml(data: NotionDBPage) {
  if (!data || !data.blocks) {
    return 'Invalid page data';
  }

  let htmlContent = `<h1>${data.title}</h1>`;

  data.blocks.forEach(block => {
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

export function renderPageContentToMarkdown(data: NotionDBPage): string {
  if (!data || !data.blocks) {
    return 'Invalid page data';
  }

  let markdownContent = `# ${data.title}\n\n`;

  data.blocks.forEach(block => {
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

export function extractPagePlainText(data: NotionDBPage): string {
  if (!data || !data.blocks) {
    return 'Invalid page data';
  }

  let plainText = `${data.title}\n\n`;

  data.blocks.forEach(block => {
    if (block.content) {
      plainText += `${block.content}\n`;
    }
  });

  return plainText.trim();
}
