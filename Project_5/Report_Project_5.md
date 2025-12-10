# Project 5 Report

## Summary
For Project 5, I created a website for a fictional equipment rental store using XHTML 1.0 Strict. This required adhering to stricter coding standards, such as not using deprecated presentational attributes. I used inline CSS via the `style` attribute to style headings (green, Arial) and paragraphs (blue, Arial). For the rental charges table, I used class selectors (`.row-a` and `.row-b`) defined in an internal style block to create an alternating "zebra striping" effect, which improves readability.

## Critical Thinking Questions & Answers

1.  **Why is inline CSS generally discouraged?**
    Inline CSS mixes content (HTML) with presentation (CSS), making the code harder to read and maintain. If you want to change the color of all headings on a site with 100 pages, you would have to edit every single `<h1>` tag individually if you used inline styles.

2.  **What is the advantage of using class selectors for the table rows?**
    Class selectors allow us to define a style once and apply it to multiple elements. For the table, this made it easy to create the alternating row colors. If we wanted to change the "gray" rows to "light blue," we would only need to change the CSS rule for `.row-b` once.

3.  **What does "XHTML 1.0 Strict" mean compared to "Transitional"?**
    XHTML 1.0 Strict does not allow presentational HTML tags (like `<font>`, `<center>`, or `<u>`) or attributes (like `bgcolor`). It forces the developer to use CSS for all styling, promoting a clean separation of concerns.

4.  **How does the `font-family` property work?**
    The `font-family` property specifies a prioritized list of fonts. For example, `font-family: Arial, sans-serif;` tells the browser to use Arial if available. If not, it falls back to the system's default sans-serif font.

5.  **Why is "zebra striping" (alternating row colors) useful in tables?**
    It helps the user's eye track a row across the table, especially in wide tables with many columns. This reduces reading errors and makes the data easier to scan.
