window.ICT600_DATA = {
  version: "2026.09.26",
  chapters: [
    { id: 1, title: "Web Technology", accent: "#38bdf8", summary: "Internet, Web, HTTP, browsers, servers, cloud and CMS" },
    { id: 2, title: "Client-Side Web Development", accent: "#22d3ee", summary: "HTML, CSS, forms, page structure and responsive design" },
    { id: 3, title: "JavaScript", accent: "#fbbf24", summary: "Language basics, DOM, events, functions and validation" },
    { id: 4, title: "Web Programming Basic", accent: "#fb7185", summary: "PHP variables, strings, arrays, control structures and forms" },
    { id: 5, title: "Web Techniques", accent: "#a78bfa", summary: "HTTP, state, cookies, sessions and AJAX" },
    { id: 6, title: "Web Databases", accent: "#34d399", summary: "Database concepts, SQL, MySQL and PHP connectivity" },
    { id: 7, title: "Framework", accent: "#60a5fa", summary: "Framework trade-offs, MVC roles, routing and request flow" },
    { id: 8, title: "Web Services", accent: "#2dd4bf", summary: "SOAP, WSDL, UDDI, REST and service architecture" },
    { id: 9, title: "Web Security", accent: "#f97316", summary: "Threats, vulnerabilities, injection, XSS and secure sessions" }
  ],
  activities: [
    {
      id: "c1-web-internet", chapter: 1, type: "mcq", difficulty: "Recall",
      prompt: "Which statement correctly distinguishes the Internet from the Web?",
      options: [
        "The Web is the network infrastructure and the Internet is a browser",
        "The Internet is network infrastructure; the Web is an information system that uses it",
        "They are two names for exactly the same system",
        "The Internet only exists inside organisations"
      ],
      answer: 1,
      explanation: "The Internet connects networks globally. The Web is one way of accessing and sharing linked information over that infrastructure.",
      source: "Chapter 1 lecture notes"
    },
    {
      id: "c1-http-parts", chapter: 1, type: "multi", difficulty: "Recall",
      prompt: "Select every item that can be part of an HTTP response.",
      options: ["Status code", "Headers", "Response body", "A mandatory database table"],
      answer: [0, 1, 2],
      explanation: "An HTTP response contains a status line/code, headers and usually a body. A database may be used by the server, but it is not a response component.",
      source: "Chapters 1 and 5 lecture notes"
    },
    {
      id: "c1-404", chapter: 1, type: "fill", difficulty: "Recall",
      prompt: "Complete the status code: A requested page cannot be found: ____.",
      answers: ["404"], answerDisplay: "404 - Not Found",
      explanation: "404 means that the server cannot find the requested resource.",
      source: "Chapter 1 lecture notes"
    },
    {
      id: "c1-request-flow", chapter: 1, type: "order", difficulty: "Understand",
      prompt: "Tap the steps in the correct order for a basic page request.",
      items: ["Browser sends an HTTP request", "Server receives and processes it", "Server returns an HTTP response", "Browser renders the result"],
      answer: [0, 1, 2, 3],
      explanation: "The browser initiates the exchange. The server processes the request, returns a response, and the browser presents it.",
      source: "Chapter 1 lecture notes"
    },
    {
      id: "c1-browser-server", chapter: 1, type: "short", difficulty: "Explain",
      prompt: "In two or three sentences, compare a web browser with a web server.",
      model: "A browser is client software that requests resources, renders HTML/CSS and runs client-side JavaScript. A web server receives HTTP requests and returns static or generated responses.",
      checklist: ["States that the browser is the client", "Explains rendering or client-side execution", "Explains that the server receives requests and returns responses"],
      source: "Chapter 1 lecture notes and verified bank C1-04"
    },
    {
      id: "c1-cms", chapter: 1, type: "short", difficulty: "Apply",
      prompt: "A faculty wants non-programmers to publish pages through a browser. Recommend a platform category and explain two useful features.",
      model: "Use a content management system (CMS). Useful features include browser-based editing, reusable themes, user roles and permissions, publishing workflow, versioning and extensions.",
      checklist: ["Recommends a CMS", "Explains one relevant feature", "Explains a second relevant feature"],
      source: "Chapter 1 lecture notes and verified bank C1-05"
    },

    {
      id: "c2-valid-heading", chapter: 2, type: "mcq", difficulty: "Recall",
      prompt: "Which heading is valid HTML?",
      options: ["<h1>Vision<h1>", "<h1>Vision</h1>", "<heading1>Vision</heading1>", "</h1>Vision<h1>"],
      answer: 1,
      explanation: "Most HTML elements use a start tag and a matching end tag with a forward slash.",
      source: "Chapter 2 lecture notes and corrected May 2020 item"
    },
    {
      id: "c2-form-parts", chapter: 2, type: "multi", difficulty: "Understand",
      prompt: "Select every feature required for a usable email control in a POST form.",
      options: ["An associated label", "A name attribute", "type=\"email\"", "A closing </input> tag"],
      answer: [0, 1, 2],
      explanation: "The label identifies the control, name submits its value, and type=email provides appropriate semantics and browser validation. input is a void element.",
      source: "Chapter 2 lecture notes"
    },
    {
      id: "c2-alt", chapter: 2, type: "fill", difficulty: "Recall",
      prompt: "Complete the image attribute used to provide a text alternative: <img src=\"logo.png\" ____=\"UiTM Logo\">",
      answers: ["alt"], answerDisplay: "alt",
      explanation: "The alt attribute supplies an alternative description when the image cannot be seen or loaded.",
      source: "Chapter 2 lecture notes and corrected May 2020 item"
    },
    {
      id: "c2-css-comment", chapter: 2, type: "mcq", difficulty: "Spot the error",
      prompt: "Which is a valid CSS comment?",
      options: ["// centre the text", "# centre the text", "/* centre the text */", "<!-- centre the text -->"],
      answer: 2,
      explanation: "CSS comments use /* ... */. The historical schemes that used // inside CSS contained invalid syntax.",
      source: "Corrected 20254 and 20262 schemes"
    },
    {
      id: "c2-linked-image", chapter: 2, type: "code", difficulty: "Apply",
      prompt: "Write valid HTML that makes logo.jpg link to https://www.uitm.edu.my/ and gives the image alternative text UiTM Logo.",
      language: "html", starter: "<!-- Write the anchor and image elements -->",
      model: "<a href=\"https://www.uitm.edu.my/\">\n  <img src=\"logo.jpg\" alt=\"UiTM Logo\">\n</a>",
      checklist: ["Correct anchor destination", "Correct image source", "Meaningful alt text", "Valid nesting and quotation marks"],
      source: "Verified bank C2-02"
    },
    {
      id: "c2-responsive", chapter: 2, type: "short", difficulty: "Apply",
      prompt: "A two-column desktop page is unreadable on a phone. Propose a responsive correction.",
      model: "Add a mobile viewport, use a flexible grid or flex layout, make images responsive, and use a media query to collapse the columns to one at a suitable breakpoint.",
      checklist: ["Mentions the viewport", "Uses a flexible layout", "Uses a media query to collapse columns", "Keeps images within their container"],
      source: "Chapter 2 lecture notes and verified bank C2-05"
    },

    {
      id: "c3-defer", chapter: 3, type: "mcq", difficulty: "Understand",
      prompt: "What does defer do on an external script in the document head?",
      options: ["Deletes the script after use", "Loads without blocking HTML parsing and runs after parsing", "Runs only when the user clicks", "Converts JavaScript into PHP"],
      answer: 1,
      explanation: "defer lets the browser continue parsing the document and executes the external script after parsing is complete.",
      source: "Updated guidance for 20262 Q3(a)"
    },
    {
      id: "c3-output-method", chapter: 3, type: "fill", difficulty: "Recall",
      prompt: "For plain text output, complete the safer DOM property: result.____________ = 'Saved';",
      answers: ["textcontent", "textContent"], answerDisplay: "textContent",
      explanation: "textContent inserts text without interpreting it as HTML. innerHTML remains valid when markup is intentionally required and trusted.",
      source: "Chapter 3 lecture notes with current safe practice"
    },
    {
      id: "c3-events", chapter: 3, type: "multi", difficulty: "Recall",
      prompt: "Select valid JavaScript event names.",
      options: ["click", "submit", "keydown", "new tab"],
      answer: [0, 1, 2],
      explanation: "click, submit and keydown are standard events. 'New tab' is an action/result, not an event name.",
      source: "Corrected undated Test 1 answer scheme"
    },
    {
      id: "c3-validation-order", chapter: 3, type: "order", difficulty: "Understand",
      prompt: "Tap the validation steps in a sensible order.",
      items: ["Listen for form submission", "Read and normalise the values", "Test the validation rules", "Prevent submission and show feedback when invalid"],
      answer: [0, 1, 2, 3],
      explanation: "The handler must first obtain the input, then evaluate the rules and respond to invalid data.",
      source: "Chapter 3 lecture notes"
    },
    {
      id: "c3-currency", chapter: 3, type: "code", difficulty: "Apply",
      prompt: "Write convertUsdToMyr(usd, rate). Return the converted amount. Use 25 and 4.34 to obtain MYR 108.50.",
      language: "javascript", starter: "function convertUsdToMyr(usd, rate) {\n  // Your code\n}",
      model: "function convertUsdToMyr(usd, rate) {\n  return usd * rate;\n}\nconst value = convertUsdToMyr(25, 4.34);\nconsole.log(value.toFixed(2)); // 108.50",
      checklist: ["Two parameters", "Correct multiplication", "Returns the result", "Correct call and two-decimal output"],
      source: "Corrected May 2020 question with the missing rate supplied"
    },
    {
      id: "c3-html-output", chapter: 3, type: "short", difficulty: "Explain",
      prompt: "When would innerHTML be reasonable, and when is textContent the better default?",
      model: "Use innerHTML only when the output intentionally contains trusted markup. Use textContent for plain or untrusted text because it does not interpret the value as HTML.",
      checklist: ["Identifies intentional trusted markup for innerHTML", "Chooses textContent for plain text", "Connects textContent to avoiding markup interpretation"],
      source: "Corrected teaching guidance for JavaScript output"
    },

    {
      id: "c4-scalars", chapter: 4, type: "multi", difficulty: "Recall",
      prompt: "Select all PHP scalar data types.",
      options: ["boolean", "integer", "float", "string", "array"],
      answer: [0, 1, 2, 3],
      explanation: "PHP scalar types are boolean, integer, float and string. An array is a compound type.",
      source: "Chapter 4 lecture notes and 20262 Test 1"
    },
    {
      id: "c4-concat", chapter: 4, type: "fill", difficulty: "Recall",
      prompt: "Complete the PHP concatenation operator: echo $first ____ $last;",
      answers: ["."], answerDisplay: ". (dot)",
      explanation: "PHP concatenates strings with the dot operator.",
      source: "Chapter 4 lecture notes"
    },
    {
      id: "c4-trace", chapter: 4, type: "mcq", difficulty: "Trace",
      prompt: "What does strpos('Web Technology', 'Mobile') return?",
      options: ["0", "4", "true", "false"],
      answer: 3,
      explanation: "The substring is absent, so strpos returns false. Always trace the exact printed string and search term.",
      source: "Corrected string-tracing pattern"
    },
    {
      id: "c4-grade", chapter: 4, type: "code", difficulty: "Apply",
      prompt: "Write grade($mark) that returns PASS for marks of at least 50 and FAIL otherwise. Show one call.",
      language: "php", starter: "function grade($mark) {\n    // Your code\n}",
      model: "function grade($mark) {\n    return $mark >= 50 ? 'PASS' : 'FAIL';\n}\necho grade(65);",
      checklist: ["One parameter", "Correct >= 50 boundary", "Returns both possible values", "Valid call"],
      source: "Verified bank and 20262 pattern"
    },
    {
      id: "c4-arrays", chapter: 4, type: "short", difficulty: "Explain",
      prompt: "Why is a multidimensional array suitable for generating a table of courses in PHP?",
      model: "Each nested array can represent one course row, while its values represent cells. A loop can process every row consistently without repeating markup or variable names.",
      checklist: ["Maps nested arrays to rows", "Maps values to cells", "Explains repeatable loop-based output"],
      source: "Chapter 4 lecture notes and repeated exam pattern"
    },
    {
      id: "c4-post", chapter: 4, type: "code", difficulty: "Apply",
      prompt: "Read name from POST, reject an empty value, and display it safely in HTML.",
      language: "php", starter: "$name = /* read the submitted value */;",
      model: "$name = trim($_POST['name'] ?? '');\nif ($name === '') {\n    exit('Name is required.');\n}\necho htmlspecialchars($name, ENT_QUOTES, 'UTF-8');",
      checklist: ["Safe default when name is absent", "Trims and rejects empty input", "Uses htmlspecialchars", "Uses ENT_QUOTES and UTF-8"],
      source: "Chapter 4 notes with secure teaching correction"
    },

    {
      id: "c5-stateless", chapter: 5, type: "mcq", difficulty: "Recall",
      prompt: "What does stateless mean for HTTP?",
      options: ["The server cannot return data", "Every request is treated independently", "Only GET is allowed", "Cookies are forbidden"],
      answer: 1,
      explanation: "HTTP does not automatically remember an earlier request. Applications add state using mechanisms such as cookies and sessions.",
      source: "Chapter 5 lecture notes"
    },
    {
      id: "c5-state", chapter: 5, type: "multi", difficulty: "Understand",
      prompt: "Select every correct statement about cookies and sessions.",
      options: ["A cookie is stored by the browser", "Session state is normally stored on the server", "A session identifier is often carried in a cookie", "POST automatically encrypts both"],
      answer: [0, 1, 2],
      explanation: "Cookies are client-side values; sessions keep state on the server and commonly use a cookie identifier. POST is not encryption.",
      source: "Chapter 5 lecture notes"
    },
    {
      id: "c5-https", chapter: 5, type: "fill", difficulty: "Recall",
      prompt: "POST does not encrypt a password. The connection should use ______ to protect data in transit.",
      answers: ["https", "tls", "https/tls"], answerDisplay: "HTTPS/TLS",
      explanation: "POST changes where data is carried; HTTPS/TLS provides transport confidentiality and integrity.",
      source: "Corrected undated Test 1 explanation"
    },
    {
      id: "c5-ajax-order", chapter: 5, type: "order", difficulty: "Understand",
      prompt: "Tap the AJAX live-search steps in order.",
      items: ["User types a query", "JavaScript sends an asynchronous request", "Server returns matching data", "JavaScript updates part of the page"],
      answer: [0, 1, 2, 3],
      explanation: "AJAX updates part of a page after an asynchronous request instead of reloading the full document.",
      source: "Chapter 5 lecture notes"
    },
    {
      id: "c5-status", chapter: 5, type: "mcq", difficulty: "Apply",
      prompt: "A logged-in student requests an administrator-only page. Which status best describes denied permission?",
      options: ["200", "401", "403", "404"],
      answer: 2,
      explanation: "403 Forbidden is appropriate when the identity is known but lacks permission. 401 indicates authentication is required or failed.",
      source: "Chapter 5 HTTP status notes"
    },
    {
      id: "c5-session-life", chapter: 5, type: "short", difficulty: "Apply",
      prompt: "Describe a safe session lifecycle from login to logout.",
      model: "Start the session before output, authenticate the user, regenerate the session ID after login, store only necessary state, check authorisation on requests, enforce timeouts, and clear/destroy the session on logout.",
      checklist: ["Starts and establishes state correctly", "Regenerates the ID after authentication", "Checks access and limits lifetime", "Clears and destroys state on logout"],
      source: "Chapters 5 and 9 lecture notes"
    },

    {
      id: "c6-dbms", chapter: 6, type: "mcq", difficulty: "Recall",
      prompt: "Which statement best defines a DBMS?",
      options: ["The organised data itself", "Software used to create, maintain and access databases", "A single HTML table", "A browser plug-in"],
      answer: 1,
      explanation: "The database contains organised data. The DBMS is the software used to manage it.",
      source: "Chapter 6 lecture notes"
    },
    {
      id: "c6-key", chapter: 6, type: "fill", difficulty: "Recall",
      prompt: "Complete the MySQL identifier definition: student_id INT __________ PRIMARY KEY",
      answers: ["auto_increment", "auto increment", "autoincrement"], answerDisplay: "AUTO_INCREMENT",
      explanation: "AUTO_INCREMENT asks MySQL to generate the next identifier value.",
      source: "Corrected final-exam DDL scheme"
    },
    {
      id: "c6-crud", chapter: 6, type: "multi", difficulty: "Understand",
      prompt: "Select every correct CRUD-to-SQL mapping.",
      options: ["Create - INSERT", "Read - SELECT", "Update - UPDATE", "Delete - DROP DATABASE"],
      answer: [0, 1, 2],
      explanation: "Deleting a record uses DELETE. DROP DATABASE removes the entire database and is not the normal CRUD delete operation.",
      source: "Chapter 6 lecture notes"
    },
    {
      id: "c6-select", chapter: 6, type: "code", difficulty: "Apply",
      prompt: "Write SQL to list name and mark from students joined to registrations for ICT600, highest mark first.",
      language: "sql", starter: "SELECT ...\nFROM students ...",
      model: "SELECT s.name, r.mark\nFROM students AS s\nJOIN registrations AS r ON r.student_id = s.student_id\nWHERE r.course_code = 'ICT600'\nORDER BY r.mark DESC;",
      checklist: ["Selects name and mark", "Joins on student_id", "Filters ICT600", "Orders mark descending"],
      source: "Verified bank C6-04"
    },
    {
      id: "c6-flow", chapter: 6, type: "order", difficulty: "Understand",
      prompt: "Tap the database-backed page steps in order.",
      items: ["Application receives the request", "Application connects or uses its database connection", "SQL query is executed", "Rows are fetched and rendered in the response"],
      answer: [0, 1, 2, 3],
      explanation: "The server-side application coordinates the request, database query and resulting response.",
      source: "Chapter 6 lecture notes"
    },
    {
      id: "c6-prepared", chapter: 6, type: "short", difficulty: "Explain",
      prompt: "Why is a prepared statement better than inserting user input directly into an SQL string?",
      model: "A prepared statement sends the SQL structure separately from bound data, so user input is treated as a value rather than executable SQL. It is the primary defence against SQL injection for parameter values.",
      checklist: ["Separates SQL structure from values", "Mentions parameter binding", "Connects the technique to SQL injection prevention"],
      source: "Chapter 6 pattern with Chapter 9 secure correction"
    },

    {
      id: "c7-framework", chapter: 7, type: "mcq", difficulty: "Recall",
      prompt: "What is a web application framework?",
      options: ["A single database record", "Reusable libraries, conventions and tools for web development", "A replacement for the Internet", "Only a visual colour theme"],
      answer: 1,
      explanation: "A framework provides reusable structure and common functionality so developers do not repeat the same infrastructure work.",
      source: "Chapter 7 lecture notes"
    },
    {
      id: "c7-mvc-fill", chapter: 7, type: "fill", difficulty: "Recall",
      prompt: "Complete the pattern name: Model - View - __________.",
      answers: ["controller"], answerDisplay: "Controller",
      explanation: "MVC separates data/business responsibilities, presentation and request coordination.",
      source: "Chapter 7 lecture notes"
    },
    {
      id: "c7-roles", chapter: 7, type: "multi", difficulty: "Understand",
      prompt: "Select every correct MVC responsibility.",
      options: ["Model - data and data-related logic", "View - presentation", "Controller - request coordination", "View - direct database administration"],
      answer: [0, 1, 2],
      explanation: "The View presents information. Direct database work belongs in the Model/data layer, not the View.",
      source: "Chapter 7 lecture notes"
    },
    {
      id: "c7-flow", chapter: 7, type: "order", difficulty: "Understand",
      prompt: "Tap the simplified MVC request flow in order.",
      items: ["Router selects a controller action", "Controller asks the Model for data", "Model returns data", "Controller passes data to the View", "View renders the response"],
      answer: [0, 1, 2, 3, 4],
      explanation: "The Controller coordinates the request; the Model supplies data; the View renders it.",
      source: "Chapter 7 lecture notes and verified bank C7-03"
    },
    {
      id: "c7-tradeoffs", chapter: 7, type: "short", difficulty: "Assess",
      prompt: "Give two advantages and two disadvantages of using a framework.",
      model: "Advantages may include reusable components, faster development, standard structure, routing/database facilities and easier teamwork. Disadvantages may include learning curve, overhead, version dependency, reduced flexibility and security risk from outdated framework code.",
      checklist: ["Two valid advantages", "Two valid disadvantages", "At least one point is explained rather than merely named"],
      source: "Chapter 7 lecture notes"
    },
    {
      id: "c7-map", chapter: 7, type: "short", difficulty: "Apply",
      prompt: "Map a student-list page to Model, View and Controller responsibilities.",
      model: "The Model retrieves student records. The Controller handles the request, calls the Model and passes records onward. The View renders the table and should not query the database directly.",
      checklist: ["Model retrieves/represents data", "Controller coordinates the request", "View renders the student table", "Keeps database access out of the View"],
      source: "Verified bank C7-05"
    },

    {
      id: "c8-app-service", chapter: 8, type: "mcq", difficulty: "Recall",
      prompt: "Which description best matches a web service?",
      options: ["A human-facing page only", "A programmatic interface for machine-to-machine interaction", "A CSS file", "A browser history list"],
      answer: 1,
      explanation: "A web service exposes data or functionality for software systems to communicate over a network.",
      source: "Chapter 8 lecture notes"
    },
    {
      id: "c8-stack", chapter: 8, type: "multi", difficulty: "Recall",
      prompt: "Select the correct traditional web-service roles.",
      options: ["SOAP - message format/protocol", "WSDL - service description", "UDDI - service registry/discovery", "CSS - message encryption"],
      answer: [0, 1, 2],
      explanation: "The lecture stack uses XML for data, SOAP for messages, WSDL for description and UDDI for traditional publication/discovery.",
      source: "Chapter 8 lecture notes"
    },
    {
      id: "c8-wsdl", chapter: 8, type: "fill", difficulty: "Recall",
      prompt: "Complete the acronym for the XML-based service description: ____.",
      answers: ["wsdl"], answerDisplay: "WSDL - Web Services Description Language",
      explanation: "WSDL describes the service interface and access details in the traditional SOAP stack.",
      source: "Chapter 8 lecture notes"
    },
    {
      id: "c8-rest-verbs", chapter: 8, type: "multi", difficulty: "Apply",
      prompt: "Select every sensible REST mapping.",
      options: ["GET /students - list", "POST /students - create", "PATCH /students/15 - partial update", "DELETE /students/15 - delete"],
      answer: [0, 1, 2, 3],
      explanation: "RESTful designs use HTTP methods to operate on resource paths. PUT may also be used for replacement-style updates.",
      source: "Chapter 8 lecture notes and verified bank C8-03"
    },
    {
      id: "c8-architecture", chapter: 8, type: "order", difficulty: "Understand",
      prompt: "Tap the traditional publish-find-bind story in order.",
      items: ["Provider describes and publishes a service", "Registry stores/discovers the service description", "Requestor obtains the description", "Requestor invokes the provider"],
      answer: [0, 1, 2, 3],
      explanation: "This is the traditional provider-registry-requestor architecture taught with WSDL and UDDI.",
      source: "Chapter 8 lecture notes"
    },
    {
      id: "c8-choice", chapter: 8, type: "short", difficulty: "Assess",
      prompt: "Choose between REST and SOAP for: (1) a lightweight mobile JSON API; (2) a strict XML contract between agencies. Justify both.",
      model: "REST fits the lightweight mobile API because it uses resource-oriented HTTP operations and lightweight representations. SOAP fits the strict XML-contract scenario when formal message and WSDL-based contract standards are required.",
      checklist: ["REST chosen for the mobile JSON API", "REST reason tied to the scenario", "SOAP chosen for the strict contract", "SOAP reason tied to the scenario"],
      source: "Verified bank C8-05"
    },

    {
      id: "c9-threat", chapter: 9, type: "mcq", difficulty: "Recall",
      prompt: "Which statement is correct?",
      options: ["A vulnerability is a weakness; a threat may exploit it", "A threat is always a programming language", "A vulnerability is a security control", "Threat and vulnerability mean exactly the same thing"],
      answer: 0,
      explanation: "A vulnerability is a weakness. A threat is something capable of exploiting a weakness and causing harm.",
      source: "Chapter 9 lecture notes"
    },
    {
      id: "c9-malware", chapter: 9, type: "multi", difficulty: "Recall",
      prompt: "Select every correct description.",
      options: ["Worm - self-replicates across systems", "Trojan - appears useful but hides malicious behaviour", "Ransomware - encrypts files for payment", "Spyware - improves password hashing"],
      answer: [0, 1, 2],
      explanation: "Spyware secretly collects information. It is not a password-security control.",
      source: "Chapter 9 lecture notes"
    },
    {
      id: "c9-sqli", chapter: 9, type: "fill", difficulty: "Recall",
      prompt: "User input concatenated directly into SQL can create __________ injection.",
      answers: ["sql", "sql injection"], answerDisplay: "SQL injection",
      explanation: "Use prepared statements and parameter binding so input is handled as data rather than SQL structure.",
      source: "Chapter 9 lecture notes"
    },
    {
      id: "c9-xss", chapter: 9, type: "fill", difficulty: "Recall",
      prompt: "Untrusted comments inserted into HTML without output encoding can create ______.",
      answers: ["xss", "cross site scripting", "cross-site scripting"], answerDisplay: "Cross-site scripting (XSS)",
      explanation: "Encode output for its destination context. In PHP HTML output, htmlspecialchars is a common control.",
      source: "Chapter 9 lecture notes"
    },
    {
      id: "c9-session-controls", chapter: 9, type: "multi", difficulty: "Apply",
      prompt: "Select every appropriate authenticated-session control.",
      options: ["Regenerate the session ID after login", "Use Secure and HttpOnly cookie attributes", "Place the session ID in every URL", "Enforce timeouts and destroy the session on logout"],
      answer: [0, 1, 3],
      explanation: "Session identifiers should stay out of URLs. Use protected cookies, regenerate identifiers and limit session lifetime.",
      source: "Chapter 9 lecture notes and verified bank C9-05"
    },
    {
      id: "c9-review", chapter: 9, type: "short", difficulty: "Assess",
      prompt: "A login uses HTTP, stores plain-text passwords and keeps the same session ID after authentication. Identify one correction for each weakness.",
      model: "Use HTTPS/TLS for login, store passwords with password_hash and verify with password_verify, and regenerate the session ID immediately after successful authentication.",
      checklist: ["Requires HTTPS/TLS", "Uses password hashing and verification", "Regenerates the session ID after login"],
      source: "Verified bank C9-05"
    }
  ]
};
