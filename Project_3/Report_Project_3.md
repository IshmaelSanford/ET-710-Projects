# Project 3 Report

## Summary
Project 3 focused on handling different types of content structures. In `Project_3_1.html`, I simulated importing content from an external source like a Word document or Excel sheet. This involved cleaning up the structure and presenting tabular data and headings clearly. In `Project_3_2.html`, I practiced creating complex lists by nesting unordered lists (bullet points) inside an ordered list (numbered steps). This is a common pattern for documentation or instructional content where main steps have sub-details.

## Critical Thinking Questions & Answers

1.  **What is the difference between "cleaning up" imported code and writing it from scratch?**
    Imported code (e.g., from Word) often contains unnecessary tags, inline styles, and proprietary attributes that bloat the file and make it hard to maintain. Writing from scratch or cleaning the code ensures semantic correctness and cleaner, more efficient markup.

2.  **When should you use a nested list?**
    Nested lists are useful when you have hierarchical information. For example, a main topic (like "Chapter 1") might have sub-topics (like "Section 1.1", "Section 1.2"). It visually groups related items under a parent category.

3.  **How does the browser know how to number the list items?**
    The browser automatically handles the numbering for `<ol>` elements. If you nest lists, the browser also handles the indentation. You can use CSS to change the numbering style (e.g., 1, 2, 3 vs I, II, III or a, b, c), but the default behavior is standard numerals.

4.  **Why is semantic HTML important for lists?**
    Using proper list tags (`<ul>`, `<ol>`, `<li>`) instead of just using line breaks or symbols allows screen readers to interpret the content correctly. It tells assistive technology "this is a list of 4 items," which improves accessibility.

5.  **Can you put other elements inside a list item (`<li>`)?**
    Yes, a list item is a block-level container that can hold other HTML elements, including paragraphs, images, links, and even other lists (which is how we create nested lists).
