# Project 4 Report

## Summary
This project demonstrates the difference between internal and external hyperlinks. I created a page with two distinct sections. The "Internal Links" section uses relative paths (e.g., `../Project_1/Project_1.html`) to navigate to other files within my local project directory. The "External Links" section uses absolute URLs (e.g., `https://www.w3schools.com/`) to point to resources on the live internet. I also included descriptive text for each link to improve usability.

## Critical Thinking Questions & Answers

1.  **What is the difference between an absolute URL and a relative URL?**
    An absolute URL contains the full address of a resource, including the protocol (`http://` or `https://`) and domain name (e.g., `https://www.google.com`). A relative URL describes the location of a file relative to the current file's location (e.g., `../images/photo.jpg`).

2.  **When should you use `target="_blank"` on a link?**
    The `target="_blank"` attribute opens the linked document in a new window or tab. This is often used for external links so that the user doesn't lose their place on your website, but it should be used sparingly as it can be disorienting for some users.

3.  **Why is descriptive link text important for accessibility?**
    Screen readers often allow users to skip through a page by reading only the links. If a link just says "Click Here," it provides no context. Descriptive text like "Read our Privacy Policy" tells the user exactly where the link goes.

4.  **What does the `..` notation mean in a file path?**
    The `..` notation signifies "go up one directory level." It is used to navigate out of the current folder to access files in a sibling or parent folder.

5.  **Why might an internal link break?**
    Internal links usually break if a file is moved, renamed, or deleted, or if the directory structure changes. Since relative paths depend on the specific relationship between files, moving either the source or the destination file can break the link.
