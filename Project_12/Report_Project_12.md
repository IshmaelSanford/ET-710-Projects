# Project 12 Report

## Summary
Project 12 serves as a capstone for the organizational aspect of web design. I created a page that visually represents the directory structure of a well-organized web project. Using nested lists and custom styling, I displayed a "folder tree" view that distinguishes between directories and files. The accompanying text explains the importance of file management, naming conventions, and separating assets (like images, CSS, and JS) into their own subfolders.

## Critical Thinking Questions & Answers

1.  **Why should you avoid spaces in file and folder names?**
    Web servers often do not handle spaces well. A URL with a space is encoded as `%20` (e.g., `my%20file.html`), which is ugly and can cause broken links in some systems. It is best practice to use hyphens (`my-file.html`) or underscores (`my_file.html`) instead.

2.  **What is the benefit of a dedicated `images` folder?**
    Websites often use dozens or hundreds of images. Mixing these in with HTML files makes the root directory cluttered and hard to navigate. A dedicated folder keeps the project clean and allows for easier asset management.

3.  **How does a consistent structure help with version control (like Git)?**
    When using version control, a clear structure helps you track changes more effectively. You can ignore certain folders (like build artifacts) easily, and teammates can pull your code and know exactly where to put new files without asking.

4.  **What is the role of a "root" directory?**
    The root directory is the top-level folder of your website. It is the starting point for all relative paths. When you upload your site to a web server, the contents of your local root directory are what become accessible to the public.

5.  **Why is it important to keep backups of your website?**
    Data loss can happen due to hardware failure, accidental deletion, or hacking. Regular backups ensure that you can restore your site to a previous working state. Using a remote repository (like GitHub) acts as an off-site backup and a history of your project's evolution.
