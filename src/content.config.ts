import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const collections = {
  docs: defineCollection({
    loader: {
      name: 'malipo-loader',
      load: async ({ store, logger, config }) => {
        const docsDir = new URL('src/content/docs/', config.root);
        const docsPath = fileURLToPath(docsDir);
        const rootPath = fileURLToPath(config.root);

        logger.info(`Loading docs from: ${docsPath}`);

        async function walkDir(dir: string): Promise<string[]> {
          const entries = await readdir(dir, { withFileTypes: true });
          const files: string[] = [];
          for (const entry of entries) {
            if (entry.name.startsWith('_')) continue;
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
              files.push(...await walkDir(fullPath));
            } else if (entry.isFile() && entry.name.endsWith('.md')) {
              files.push(fullPath);
            }
          }
          return files;
        }

        const files = await walkDir(docsPath);
        logger.info(`Found ${files.length} files`);

        for (const filePath of files) {
          const content = await readFile(filePath, 'utf-8');

          // Parse frontmatter
          const frontmatter: Record<string, unknown> = {};
          const bodyMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
          let body = content;

          if (bodyMatch) {
            const fmLines = bodyMatch[1].split('\n');
            for (const line of fmLines) {
              const sep = line.indexOf(':');
              if (sep > 0) {
                const key = line.slice(0, sep).trim();
                let value: string | boolean = line.slice(sep + 1).trim();
                if (value === 'true') value = true;
                else if (value === 'false') value = false;
                else value = value.replace(/^["']|["']$/g, '');
                frontmatter[key] = value;
              }
            }
            body = bodyMatch[2];
          }

          // Generate ID from relative path
          const relPath = relative(docsPath, filePath);
          const id = relPath.replace(/\.md$/, '');
          const relToRoot = relative(rootPath, filePath);

          const defaultData = {
            title: id,
            description: '',
            head: [],
            template: 'doc' as const,
            pagefind: true,
            draft: false,
            sidebar: { hidden: false },
          };

          store.set({
            id,
            data: {
              ...defaultData,
              title: frontmatter.title as string || id,
              description: frontmatter.description as string || '',
              ...frontmatter,
            },
            body,
            filePath: relToRoot,
            digest: Buffer.from(content).toString('base64').slice(0, 32),
          });
        }
      },
    },
    schema: docsSchema(),
  }),
};
