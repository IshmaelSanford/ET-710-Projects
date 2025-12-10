# Project 7 Report

## Summary
In Project 7, I worked with HTML tables to display structured data. `Project_7_1.html` features a standard product list table with a header row and columns for images and descriptions. I applied CSS to style the borders and background colors. In `Project_7_2.html`, I demonstrated the concept of a "nested table" by placing a smaller table inside a cell of the main table. This allows for more complex data presentation, such as listing specific product details (Condition, Warranty) within the main product row.

## Critical Thinking Questions & Answers

1.  **What is a nested table?**
    A nested table is simply a `<table>` element placed inside a `<td>` (table cell) of another table. It acts as content within that cell.

2.  **Why were nested tables common in older web design?**
    Before CSS layout techniques (like Flexbox and Grid) became standard, developers used tables to create complex page layouts. Nested tables were the only way to divide a specific section of a page into smaller columns or rows without affecting the rest of the page structure.

3.  **Why is using tables for layout considered bad practice today?**
    Tables are semantically meant for tabular data (like spreadsheets), not for page layout. Using them for layout confuses screen readers, makes the code bloated and hard to maintain, and makes it very difficult to create responsive designs that work on mobile phones.

4.  **How do you control the spacing inside a table cell?**
    We use the CSS `padding` property on the `td` or `th` elements to control the space between the cell content and the cell border. In older HTML, the `cellpadding` attribute was used on the `table` tag.

5.  **What is the difference between `border-collapse: collapse` and `separate`?**
    `border-collapse: separate` (the default) keeps a small space between the borders of adjacent cells. `border-collapse: collapse` merges adjacent borders into a single line, creating a cleaner, more modern look often seen in spreadsheets.
