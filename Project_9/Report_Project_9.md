# Project 9 Report

## Summary
This project demonstrates a simple parallax scrolling effect using CSS. The core of the effect is achieved with the `background-attachment: fixed;` property. This tells the browser to keep the background image in the same position relative to the viewport, even as the user scrolls down the page. By alternating these fixed-background sections with standard content sections (which scroll normally), we create the illusion that the background is further away than the foreground content, adding depth to the page.

## Critical Thinking Questions & Answers

1.  **How does `background-attachment: fixed` work?**
    It fixes the background image to the viewport (the browser window) rather than the element itself. This means that as the element moves up the screen during scrolling, the background image appears to stay still, revealing different parts of the image through the element's "window."

2.  **What are the potential performance issues with parallax?**
    Complex parallax effects, especially those calculated with JavaScript on every scroll event, can cause "jank" or stuttering scrolling, particularly on mobile devices. The CSS-only method used here is generally more performant but can still be resource-intensive on older devices.

3.  **Is parallax scrolling good for mobile users?**
    It can be problematic. On touch screens, `background-attachment: fixed` is sometimes disabled or behaves differently to save battery and processing power. It's often best to disable parallax on mobile or use a simplified version.

4.  **How does this affect accessibility?**
    Parallax effects can trigger motion sickness (vestibular disorders) in some users. It is a best practice to respect the user's system preference for "reduced motion" (using a media query like `@media (prefers-reduced-motion: reduce)`) and disable the effect for those users.

5.  **When is it appropriate to use parallax?**
    Parallax is best used for storytelling, landing pages, or showcasing products where you want to create an immersive visual experience. It should not be used for content-heavy sites (like news articles or wikis) where readability is the priority.
