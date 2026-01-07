# Markdown-Driven React Native

> Build mobile apps using AI-generated Markdown files with embedded dynamic inputs

## The Idea

AI excels at working with Markdown. What if we could build entire React Native mobile applications using Markdown (MDX) as the primary specification language?

```markdown
---
title: "Contact Form"
route: "/contact"
inputs:
  - id: name
    type: text
    label: "Your Name"
    validation: { required: true }
  - id: email
    type: email
    label: "Email"
---

# Get in Touch

<Card>
  <InputField inputId="name" />
  <InputField inputId="email" />
  <Button action="submit">Send Message</Button>
</Card>
```

This renders as a fully functional, native mobile form.

## Why This Matters

1. **AI-Native Development**: LLMs can generate and modify Markdown naturally
2. **Human-Readable**: Non-developers can understand and edit content
3. **Version Controllable**: Git-friendly, diff-friendly
4. **Rapid Iteration**: Change content without rebuilding the app
5. **Proven Pattern**: Similar to Server-Driven UI used by Airbnb, Shopify, Lyft

## Documents

| Document | Description |
|----------|-------------|
| [Feasibility Analysis](./FEASIBILITY_ANALYSIS.md) | Full technical research and architecture |
| [Task Breakdown](./TASK_BREAKDOWN.md) | Detailed implementation tasks |

## Quick Assessment

| Aspect | Assessment |
|--------|------------|
| Technical Feasibility | **High** (90%) |
| Library Support | **Good** (75%) |
| AI Compatibility | **Excellent** (95%) |
| Production Ready | **Needs Work** (60%) |

## Key Technologies

- **Expo/React Native**: Mobile framework
- **@bacons/mdx**: MDX-to-RN compilation
- **YAML Frontmatter**: Dynamic input definitions
- **Claude API**: AI content generation

## Next Steps

1. Review [Feasibility Analysis](./FEASIBILITY_ANALYSIS.md)
2. Approve approach
3. Begin Phase 1 from [Task Breakdown](./TASK_BREAKDOWN.md)
