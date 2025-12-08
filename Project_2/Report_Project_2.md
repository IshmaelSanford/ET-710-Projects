# Project 2 Report

## Summary
In this project, I expanded on the basic HTML structure by creating two separate files: a specific project page (`Project_2.html`) and a main landing page (`Default.html`). The `Default.html` file acts as a directory or "home page" for the course, containing hyperlinks to the individual project pages. This setup mimics a real-world website structure where a central hub connects various content pages. I continued to use XHTML 1.0 Transitional syntax to ensure compatibility and good coding practices.

## Critical Thinking Questions & Answers

1.  **What is the purpose of a "Default.html" or "index.html" file?**
    Web servers are typically configured to look for a specific file name (like `index.html` or `Default.html`) when a user visits a directory URL without specifying a filename. This serves as the entry point or "home page" for that folder.

2.  **How do relative links work?**
    Relative links specify the path to a file based on the current file's location. For example, linking to `Project_2.html` from `Default.html` in the same folder just requires the filename. Linking to a file in a sibling folder (like `../Project_1/Project_1.html`) requires navigating up and down the directory tree.

3.  **Why is it better to have a central home page?**
    A central home page provides navigation and context for users. Without it, users would have to know the exact URL of every page they want to visit. It organizes the site's content in a user-friendly way.

4.  **What happens if a link path is incorrect?**
    If a link path is incorrect (e.g., a typo in the filename or wrong folder path), the browser will return a "404 Not Found" error when the user clicks the link, as it cannot locate the resource.

5.  **Why did we use XHTML 1.0 Transitional again?**
    We used XHTML 1.0 Transitional to maintain consistency with the previous project and to continue practicing strict, well-formed markup while still allowing for some older presentational attributes if necessary.
