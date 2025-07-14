import React from 'react';

const Index: React.FC = () => {
  return (
    <div>
      <header>
        <h1>Main Heading (h1)</h1>
        <nav>
          <ul>
            <li><a href="#section1">Section 1</a></li>
            <li><a href="#section2">Section 2</a></li>
            <li><a href="#section3">Section 3</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="section1">
          <h2>Typography Elements (h2)</h2>
          <h3>Subheading (h3)</h3>
          <h4>Smaller Heading (h4)</h4>
          <h5>Even Smaller (h5)</h5>
          <h6>Smallest Heading (h6)</h6>
          
          <p>This is a <strong>paragraph</strong> with some <em>emphasized text</em>. It contains <a href="#">a link</a> and some <code>inline code</code>. You can also have <small>small text</small> and <mark>highlighted text</mark>.</p>
          
          <blockquote>
            <p>This is a blockquote. It's used for longer quotes and should be styled differently from regular paragraphs.</p>
            <cite>- Citation Source</cite>
          </blockquote>
          
          <pre><code>{`// This is preformatted code block
function example() {
    return "Hello World";
}`}</code></pre>
        </section>

        <section id="section2">
          <h2>Lists and Media</h2>
          
          <h3>Unordered List</h3>
          <ul>
            <li>First item</li>
            <li>Second item with <a href="#">a link</a></li>
            <li>Third item
              <ul>
                <li>Nested item 1</li>
                <li>Nested item 2</li>
              </ul>
            </li>
          </ul>
          
          <h3>Ordered List</h3>
          <ol>
            <li>First numbered item</li>
            <li>Second numbered item</li>
            <li>Third numbered item</li>
          </ol>
          
          <h3>Definition List</h3>
          <dl>
            <dt>Term 1</dt>
            <dd>Definition for term 1</dd>
            <dt>Term 2</dt>
            <dd>Definition for term 2</dd>
          </dl>
          
          <h3>Image</h3>
          <img src="https://via.placeholder.com/300x200" alt="Placeholder image" />
          
          <h3>Figure with Caption</h3>
          <figure>
            <img src="https://via.placeholder.com/250x150" alt="Another placeholder" />
            <figcaption>This is a figure caption</figcaption>
          </figure>
        </section>

        <section id="section3">
          <h2>Form Elements</h2>
          
          <form>
            <fieldset>
              <legend>Personal Information</legend>
              
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" name="name" placeholder="Enter your name" />
              
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" placeholder="Enter your email" />
              
              <label htmlFor="password">Password:</label>
              <input type="password" id="password" name="password" />
              
              <label htmlFor="message">Message:</label>
              <textarea id="message" name="message" rows={4} placeholder="Enter your message"></textarea>
              
              <label htmlFor="country">Country:</label>
              <select id="country" name="country">
                <option value="">Select a country</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
              </select>
              
              <fieldset>
                <legend>Preferences</legend>
                <input type="checkbox" id="newsletter" name="newsletter" />
                <label htmlFor="newsletter">Subscribe to newsletter</label>
                
                <input type="radio" id="male" name="gender" value="male" />
                <label htmlFor="male">Male</label>
                
                <input type="radio" id="female" name="gender" value="female" />
                <label htmlFor="female">Female</label>
              </fieldset>
              
              <button type="submit">Submit</button>
              <button type="button">Cancel</button>
              <input type="reset" value="Reset" />
            </fieldset>
          </form>
        </section>

        <section>
          <h2>Table</h2>
          <table>
            <caption>Sample Data Table</caption>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>City</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Doe</td>
                <td>25</td>
                <td>New York</td>
                <td>Active</td>
              </tr>
              <tr>
                <td>Jane Smith</td>
                <td>30</td>
                <td>Los Angeles</td>
                <td>Inactive</td>
              </tr>
              <tr>
                <td>Bob Johnson</td>
                <td>35</td>
                <td>Chicago</td>
                <td>Active</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Total: 3 users</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section>
          <h2>Miscellaneous Elements</h2>
          
          <details>
            <summary>Click to expand details</summary>
            <p>This content is hidden by default and shows when you click the summary.</p>
          </details>
          
          <hr />
          
          <address>
            Contact: <a href="mailto:test@example.com">test@example.com</a><br />
            Phone: <a href="tel:+1234567890">+1 (234) 567-890</a>
          </address>
          
          <p>Here's some text with <abbr title="HyperText Markup Language">HTML</abbr> abbreviation.</p>
          
          <p>Mathematical expression: E = mc<sup>2</sup></p>
          <p>Chemical formula: H<sub>2</sub>O</p>
          
          <p>You can <del>delete this text</del> and <ins>insert this text</ins> instead.</p>
          
          <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy
          
          <p>The <var>variable</var> represents a value.</p>
          
          <p>Press <samp>Enter</samp> to continue.</p>
        </section>
      </main>

      <aside>
        <h2>Sidebar</h2>
        <p>This is sidebar content that might contain additional information or navigation.</p>
      </aside>

      <footer>
        <p>&copy; 2024 Test Website. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;