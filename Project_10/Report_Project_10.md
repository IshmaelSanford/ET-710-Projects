# Project 10 Report

## Summary
In Project 10, I used JavaScript to perform basic arithmetic operations. I declared two variables, `A` (assigned the value 8) and `B` (assigned the value 2). I then used the standard JavaScript operators (`+`, `-`, `*`, `/`, `%`) to calculate the sum, difference, product, quotient, and modulus of these two numbers. The results were dynamically inserted into the HTML page using `document.getElementById().innerHTML`, demonstrating how JavaScript can manipulate page content.

## Critical Thinking Questions & Answers

1.  **What is the Modulus operator (`%`) and when is it used?**
    The modulus operator returns the remainder of a division operation. For example, `10 % 3` is `1` because 3 goes into 10 three times with 1 left over. It is commonly used to check if a number is even or odd (number % 2 === 0) or to cycle through a range of numbers.

2.  **What is the difference between `let`, `const`, and `var`?**
    `let` and `const` are modern (ES6) ways to declare variables. `let` allows you to reassign the value later, while `const` creates a read-only reference (the value cannot be reassigned). `var` is the older way to declare variables and has different scoping rules (function-scoped vs block-scoped), which can sometimes lead to bugs.

3.  **Does JavaScript distinguish between integers and floating-point numbers?**
    No, JavaScript has a single number type (Number), which is a double-precision 64-bit binary format IEEE 754 value. This means `5` and `5.0` are treated as the same type, unlike in languages like C or Java where `int` and `float` are distinct.

4.  **What happens if you try to divide by zero in JavaScript?**
    Unlike some languages that throw an error, JavaScript returns a special value called `Infinity` (or `-Infinity`). If you try to divide zero by zero, it returns `NaN` (Not a Number).

5.  **Why did we use `innerHTML` to display the results?**
    `innerHTML` allows us to insert HTML markup (like `<div>` tags and `<br>` tags) along with the text results. If we just used `innerText` or `textContent`, the HTML tags would be displayed as plain text rather than being rendered by the browser.
