# Background
I built an interactive web application to demonstrate how Hamming codes detect and correct errors. Users can encode a custom message, corrupt the transmission, and decode the received message.

The web application is hosted on Github Pages. [Try it out here!](https://ben-boozled.github.io/Hamming_Code_Lab/) 

Alternatively, you can [run it locally](https://github.com/ben-boozled/Hamming_Code_Lab/tree/main#running-locally). Here is a preview of what to expect:

<div align="center">
  <img src="https://github.com/ben-boozled/Hamming_Code_Lab/raw/main/Images/Web_App_Demo.gif" alt="Web app demo GIF" width="775">
</div>

## Author's Note
This project is heavily inspired by 3Blue1Brown's [YouTube video on Hamming Codes](https://www.youtube.com/watch?v=X8jsijhllIA&t=272s). I highly recommend watching the video. It is hands down, one of the best explanations for Hamming codes I have ever seen. 

If you intend to modify the source code for your own use, the sections on [Unit Test](https://github.com/ben-boozled/Hamming_Code_Lab#unit-tests) and [Building and Running in Production Mode](https://github.com/ben-boozled/Hamming_Code_Lab/tree/main#building-and-running-in-production-mode) might be helpful. 

Further details on the project implementation and mathematics behind Hamming codes have also been included in `Hamming_Code_Math.md`.

---

_Sidenote: This was intended to be a quick weekend project built and deployed using Python Streamlit. Several weekends later, it finally crawled pass the finish line with Svelte (ꈍ ω ꈍ). The original Streamlit version was embedded with so much HTML, CSS, and JavaScript that it made more sense to build the application natively. I chose Svelte because the web application has a fairly simple structure: a single page with most components driven by a handful of states._

# Folder Structure
This is the project directory:
```
Hamming_Code_Lab/
├── .github
│   ├── workflows
│   │   └── deploy.yml              # configuration file for the CI/CD (test, build, deploy) to Github Pages
├── Images                          # stores the images used in this repository; not required to build and run the application
├── src
│   ├── lib/                        # stores reusable app components
│   │   ├── BitGrid.svelte
│   │   ├── cells.js
│   │   ├── hamming.js              # the actual implementation of the Hamming encoding and decoding process
│   │   ├── hamming.test.js         # unit tests for hamming.js; run using "npm test"
│   │   ├── Pig.svelte              # try typing "Hamming" into the message box of the app ( ͡° ͜ʖ ͡°)
│   │   ├── Step.svelte
│   │   └── SyndromePanel.svelte
│   ├── app.css                     # global styles and design tokens
|   ├── App.svelte                  # the main component holding the app's state variables and the page layout
|   └── main.js                     # the JavaScript entry point; imports global CSS and the App component; mounts App into index.html
├── .gitignore
├── Hamming_Code_Math.md            # Explanations and mathematics behind Hamming codes
├── index.html                      # the html page serving as the entry point of the entire project
├── package-lock.json               # lists the exact project dependency versions
├── package.json                    # lists the project dependencies and configurations for various "npm run" commands
├── README.md
└── vite.config.js                  # Vite configurations for terminal commands
```

## Running Locally
To run the application locally, you will first need to install [Node.js](https://nodejs.org/en) and add the installed **node.exe** to your system's PATH. Then, open the command line and enter the following terminal commands:
1. Change your working directory to wherever you want to clone this repository.
``` cmd
cd <path to the Hamming_Code_Lab project directory>
```  
2. Clone the repository.
``` cmd
git clone https://github.com/ben-boozled/Hamming_Code_Lab.git
```
3. Navigate to the project folder.
``` cmd
cd Hamming_Code_Lab
```
4. Install the project dependencies. The command below creates a new `node_modules/` folder to install the project dependencies from `package.json`.
``` cmd
npm install
```
5. Run the web application. The command below opens [localhost:5173](http://localhost:5173/) in your browser to run the application. Port 5173 is the default local web address for the Vite development server.
``` cmd
npm run dev
```

## Unit Tests
`hamming.tests.js` is not required to run the application. It is included as a unit test to ensure that any changes do not silently break the encode and decode logic in `hamming.js`. `hamming.tests.js` runs 13 tests to ensure the Hamming code and SECDED logic behave as expected:
- 1x text to bits and bits to text round-trip test.
- 1x code size test.
- 5x single-bit error detection and correction tests (with SECDED turned off).
- 5x single-bit error detection and correction tests (with SECDED turned on).
- 1x double error detection test.

Run the tests on `hamming.js` by entering the terminal commands below:
``` cmd
cd <path to the Hamming_Code_Lab project directory>
npm test
```

This is the expected result when `hamming.js` passes all test cases:

<div align="center">
  <img src="https://github.com/ben-boozled/Hamming_Code_Lab/raw/main/Images/Hamming_Code_Unit_Tests.png" alt="Expected test results for hamming.js" width="700">
</div>

>[!IMPORTANT]
> `.github/workflows/deploy.yml` has been written such that when changes are pushed to `main`, Github starts a Linux machine to test the code using `hamming.test.js`, build the new site, and deploy the updated site to Github Pages. Since the workflow is initiated when commits are pushed to `main`, changes that fail any of the tests in `hamming.test.js` will still be commited to `main`; only the building and deployment to Github Pages will be stopped.

## Building and Running in Production Mode
The `.svelte` source files cannot run directly in the browser; they need to be converted into browser-readable HTML, CSS, and JavaScript assets first. Svelte uses Vite as the default build and development tool for this process. Note that the Hamming code web application built in this project is a static site. All of its interactivity comes from the JavaScript elements that are already part of the production build files. These JavaScript assets run on the user's own browser, not on any separate server.

To build the Svelte application for deployment using Vite:

1. Build the project. This will create a new `dist/` folder to save the production build files. The assets in `dist/` are the complete static site; everything the web application needs at runtime is in this folder.
```cmd
cd <path to the Hamming_Code_Lab project directory>
npm run build    
```
2. Preview the built project. The command below opens [localhost:4173](http://localhost:4173/) in your browser to run the application. This preview shows exactly how the application will behave based on the production build files in `dist/`. Use this to confirm the files work before any deployment.
```cmd
npm run preview    
```

If the above steps go well, you can deploy `dist/` as the site artifact to the server of your choice.

>[!NOTE]
>The various npm terminal commands used to call Vite (e.g. `npm run dev` in [Running Locally](https://github.com/ben-boozled/Hamming_Code_Lab#running-locally) or `npm run build`) are defined in `package.json`.
