import { unified } from 'unified';
import remarkParse from 'remark-parse';

export class MarkdownExtractor {
  static async parse(content: string) {
    const processor = unified().use(remarkParse);
    return processor.parse(content);
  }
}
