import { defineConfig } from 'vitepress'
import { createTitle, normalize } from "vitepress/dist/client/shared.js";
import { transformerNotationMap } from '@shikijs/transformers';

const HOSTNAME = "https://crawlspace2.wiki";

function href(path = "") {
  return new URL(normalize(path), HOSTNAME).href;
}

const xmlRemoveDiffTransformer = transformerNotationMap({
  classMap: { 
    'rm': 'diff remove'
  },
  classActivePre: 'has-diff',
  matchAlgorithm: 'v3',
});

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Crawlspace 2 Modding Wiki",
  description: "A modding wiki for Crawlspace 2",
  head: [
    ['link', { rel:'icon', href: "/favicon.ico" }],
    ['meta', { property: 'og:site_name', content: "Crawlspace 2 Modding Wiki" }],
    ['meta', { property: 'og:image', content: "https://crawlspace2.wiki/logo.png" }],
    ['meta', { name: 'theme-color', content: "#ff3600" }]
  ],
  transformPageData(pageData, ctx) {
    let pageDescription = pageData.frontmatter?.description;
    const pageHref = href(pageData.relativePath);
    const pageTitle = createTitle(ctx.siteConfig.site, pageData);

    if (!pageDescription) {
      pageDescription = ctx.siteConfig.site?.description;

      // If no page-specific description and not homepage, prepend the site title to the description
      if (pageDescription && pageHref !== href()) {
        pageDescription = [ctx.siteConfig.site?.title, pageDescription]
            .filter((v) => Boolean(v))
            .join(": ");
      }
    }

    pageData.frontmatter.head ??= [];

    pageData.frontmatter.head.push(
        [
          "meta",
          {
            name: "og:title",
            content: pageTitle,
          },
        ],
        [
          "meta",
          {
            property: "og:url",
            content: pageHref,
          },
        ],
        [
          "meta",
          {
            name: "twitter:title",
            content: pageTitle,
          },
        ],
    );

    if (pageDescription) {
      pageData.frontmatter.head.push(
          [
            "meta",
            {
              name: "og:description",
              content: pageDescription,
            },
          ],
          [
            "meta",
            {
              name: "twitter:description",
              content: pageDescription,
            },
          ],
      );
    }
  },
  sitemap: {
    hostname: HOSTNAME
  },
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local' // TODO: Set up algolia for better-performing searches
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Beginner\'s Guide', link: '/overview.md' },
      { text: 'Developer\'s Guide', link: '/dev/overview.md' }
    ],

    sidebar: {
      '/': [
        {
          items: [
            {text: 'Beginner\'s Guide', link: '/overview'},
            {
              text: 'Installing Mods',
              items: [
                {text: 'Using r2modman', link: '/installation/installing-r2modman'},
                {text: 'Sharing r2modman Profiles', link: '/installation/syncing-mods'},
                {text: 'Configuring Mods', link: '/installation/configuration'}
              ]
            },
            {
              text: 'Other Resources',
              items: [
                { text: 'Frequently Asked Questions', link: '/extras/faq'},
                { text: 'Contributing Articles', link: '/contribute/writing-articles' },
                {text: 'About', link: '/extras/about'}
              ]
            },
          ]
        }
        ],
      '/dev/': [
        {
          items: [
            {
              text: 'Developer\'s Guide', link: '/dev/overview'
            },
            { 
              text: 'Creating Mods', 
              items: [
                { text: 'Initial Setup', link: '/dev/initial-setup' },
                { text: 'Starting a Mod', link: '/dev/starting-a-mod' },
                { text: 'Mod Testing Tips', link: '/dev/mod-testing-tips' },
                { text: 'Open-Source & Ethics', link: '/dev/open-source-and-ethics' },
                { text: 'Publishing Your Mod', link: '/dev/publishing-your-mod' }
              ]
            },
            { 
              text: 'Modding Topics', 
              items: [
                {
                  text: 'Fundamentals',
                  collapsed: false,
                  items: [
                    { text: "Logging", link: '/dev/fundamentals/logging'},
                    { text: "Reading Game Code", link: '/dev/fundamentals/reading-game-code'},
                      { 
                        text: "Patching Code",
                        link: '/dev/fundamentals/patching-code'
                      }
                  ]
                },
                {
                  text: 'Intermediate',
                  collapsed: false,
                  items: [
                    { text: 'Custom Configs', link: '/dev/intermediate/custom-configs' },
                    { text: 'Asset Bundling', link: '/dev/intermediate/asset-bundling' },
                  ]
                }
              ]
            },
            { 
              text: 'Modding APIs', 
              items: [
                { text: 'Overview', link: '/dev/apis/overview' }
              ]
            },
            {
              text: 'Other Resources',
              items: [
                { text: 'Frequently Asked Questions', link: '/extras/faq'},
                { text: 'Contributing Articles', link: '/contribute/writing-articles' },
                { text: 'About', link: '/extras/about' }
              ]
            }
          ]
        }
      ],
    },
    externalLinkIcon: true,
    outline: 'deep',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/misterbubb/ModdingWiki' }
    ],
    editLink: {
      pattern: 'https://github.com/misterbubb/ModdingWiki/edit/main/docs/:path',
    },
    docFooter: {
      prev: false,
      next: false,
    }
  },
  lastUpdated: true,
  vite: {
    ssr: {
      noExternal: [
        '@nolebase/vitepress-plugin-highlight-targeted-heading',
      ],
    },
  },
  markdown: {
    languageAlias: { 'il': 'shellscript' },
    codeTransformers: [
      xmlRemoveDiffTransformer
    ]
  }
})
