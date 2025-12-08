# Project 8 Report

## Summary
This project demonstrates how to create an interactive web form and process user input using client-side JavaScript. I built a form with various input types: text fields, a dropdown menu, radio buttons, a checkbox, and a text area. Instead of sending the data to a server (which requires backend code), I used JavaScript to intercept the form's `submit` event. The script prevents the page from reloading, retrieves the values entered by the user, and dynamically updates the HTML content of a "Submitted Data" section to display the results instantly.

## Critical Thinking Questions & Answers

1.  **Why do we use `event.preventDefault()` in the JavaScript code?**
    By default, clicking a "Submit" button inside a form causes the browser to send a request to the server and reload the page. `event.preventDefault()` stops this default behavior, allowing us to handle the data with JavaScript on the current page without a refresh.

2.  **What is the difference between radio buttons and checkboxes?**
    Radio buttons are used when the user must select exactly one option from a group (mutually exclusive). Checkboxes are used when the user can select zero, one, or multiple options independently.

3.  **Why is client-side validation (or processing) useful?**
    It provides immediate feedback to the user without waiting for a server response. This improves the user experience by making the application feel faster and more responsive. However, for security, critical validation should always be repeated on the server.

4.  **How do we access the value of a selected radio button in JavaScript?**
    Since multiple radio buttons share the same `name` attribute, we can use `document.querySelector('input[name="yourName"]:checked').value` to find the specific one that is currently selected and get its value.

5.  **What is the purpose of the `<label>` tag?**
    The `<label>` tag improves accessibility and usability. When a user clicks on the text inside a label, it automatically focuses or selects the associated input field. This is especially helpful for small click targets like radio buttons and checkboxes.
