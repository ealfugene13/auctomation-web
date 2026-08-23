const clientIdInput =
  document.getElementById(
    "clientId"
  );

const connectButton =
  document.getElementById(
    "connectFacebook"
  );

const connectMessage =
  document.getElementById(
    "connectMessage"
  );

const connectSection =
  document.getElementById(
    "connect-section"
  );

const pagesSection =
  document.getElementById(
    "pages-section"
  );

const pagesList =
  document.getElementById(
    "pagesList"
  );

const refreshButton =
  document.getElementById(
    "refreshPages"
  );


/* =========================================================
   STORAGE KEY
   ========================================================= */

const CLIENT_STORAGE_KEY =
  "auctomation_client_id";


/* =========================================================
   READ QUERY PARAMETERS
   ========================================================= */

function getQueryParameter(
  name
) {

  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get(
    name
  );

}


/* =========================================================
   GET CLIENT ID
   =========================================================
   
   Priority:
   
   1. URL parameter
   2. Local storage
   3. Input field
   
   The URL must have priority because Facebook OAuth
   redirects back with:
   
   ?client_id=...
   &facebook_connected=true
   ========================================================= */

function getClientId() {

  const queryClientId =
    getQueryParameter(
      "client_id"
    );


  if (
    queryClientId
  ) {

    localStorage.setItem(
      CLIENT_STORAGE_KEY,
      queryClientId
    );

    return queryClientId;

  }


  const storedClientId =
    localStorage.getItem(
      CLIENT_STORAGE_KEY
    );


  if (
    storedClientId
  ) {

    return storedClientId;

  }


  const inputValue =
    clientIdInput.value.trim();


  if (
    inputValue
  ) {

    localStorage.setItem(
      CLIENT_STORAGE_KEY,
      inputValue
    );

    return inputValue;

  }


  return null;

}


/* =========================================================
   RESTORE CLIENT ID
   ========================================================= */

function restoreClientId() {

  const queryClientId =
    getQueryParameter(
      "client_id"
    );


  const storedClientId =
    localStorage.getItem(
      CLIENT_STORAGE_KEY
    );


  const clientId =
    queryClientId ||
    storedClientId;


  if (
    clientId
  ) {

    localStorage.setItem(
      CLIENT_STORAGE_KEY,
      clientId
    );


    clientIdInput.value =
      clientId;

  }

}


/* =========================================================
   SHOW CONNECT SCREEN
   ========================================================= */

function showConnectScreen() {

  connectSection.classList.remove(
    "hidden"
  );


  pagesSection.classList.add(
    "hidden"
  );

}


/* =========================================================
   SHOW PAGES SCREEN
   ========================================================= */

function showPagesScreen() {

  connectSection.classList.add(
    "hidden"
  );


  pagesSection.classList.remove(
    "hidden"
  );

}


/* =========================================================
   CONNECT FACEBOOK
   ========================================================= */

function connectFacebook() {

  /*
   * For a new connection we intentionally use
   * the value currently entered by the user.
   */

  const inputClientId =
    clientIdInput.value.trim();


  if (
    !inputClientId
  ) {

    connectMessage.textContent =
      "Please enter your Client ID.";

    return;

  }


  /*
   * Save client before leaving GitHub Pages.
   */

  localStorage.setItem(
    CLIENT_STORAGE_KEY,
    inputClientId
  );


  connectButton.disabled =
    true;


  connectMessage.textContent =
    "Redirecting to Facebook...";


  const url =
    new URL(
      CONFIG.FACEBOOK_OAUTH_START
    );


  url.searchParams.set(
    "client_id",
    inputClientId
  );


  /*
   * This is available for future callback support.
   */

  url.searchParams.set(
    "return_url",
    window.location.origin +
    window.location.pathname
  );


  window.location.href =
    url.toString();

}


/* =========================================================
   LOAD CONNECTED PAGES
   ========================================================= */

async function loadPages() {

  const clientId =
    getClientId();


  if (
    !clientId
  ) {

    showConnectScreen();

    return;

  }


  /*
   * Make sure input also reflects current client.
   */

  clientIdInput.value =
    clientId;


  pagesList.innerHTML =
    `
      <div class="empty-message">
        Loading connected Pages...
      </div>
    `;


  try {

    const url =
      new URL(
        CONFIG.CLIENT_PAGES_ENDPOINT
      );


    url.searchParams.set(
      "client_id",
      clientId
    );


    console.log(
      "Loading connected Pages:",
      url.toString()
    );


    const response =
      await fetch(
        url.toString(),
        {
          method:
            "GET",

          headers: {
            Accept:
              "application/json"
          },

          cache:
            "no-store"
        }
      );


    /*
     * Read as text first.
     *
     * This gives us a useful error if the Edge Function
     * accidentally returns HTML instead of JSON.
     */

    const responseText =
      await response.text();


    let result;


    try {

      result =
        JSON.parse(
          responseText
        );

    }

    catch {

      throw new Error(
        `client-pages returned an invalid response: ${responseText}`
      );

    }


    console.log(
      "client-pages result:",
      result
    );


    if (
      !response.ok ||
      result.success === false
    ) {

      throw new Error(
        result.message ||
        result.error ||
        "Unable to load connected Pages."
      );

    }


    const pages =
      Array.isArray(
        result.pages
      )
        ? result.pages
        : [];


    /* -----------------------------------------------------
       NO CONNECTED PAGE
       ----------------------------------------------------- */

    if (
      pages.length === 0
    ) {

      showConnectScreen();


      connectMessage.textContent =
        "No Facebook Pages are connected to this client yet.";


      return;

    }


    /* -----------------------------------------------------
       CONNECTED
       ----------------------------------------------------- */

    showPagesScreen();


    pagesList.innerHTML =
      "";


    for (
      const page of pages
    ) {

      const element =
        document.createElement(
          "div"
        );


      element.className =
        "page-item";


      const status =
        page.connection_status ||
        page.status ||
        "CONNECTED";


      element.innerHTML =
        `
          <div>

            <div class="page-name">
              ${escapeHtml(
                page.page_nm ||
                "Facebook Page"
              )}
            </div>

            <div class="page-id">
              Page ID:
              ${escapeHtml(
                page.fb_page_id ||
                ""
              )}
            </div>

          </div>

          <div class="page-status">
            ${escapeHtml(
              status
            )}
          </div>
        `;


      pagesList.appendChild(
        element
      );

    }


    /*
     * Once the connected Page has loaded successfully,
     * remove OAuth status parameters from the address bar.
     *
     * Client ID remains saved in localStorage.
     */

    cleanOAuthParameters();

  }

  catch (
    error
  ) {

    console.error(
      "Unable to load connected Pages:",
      error
    );


    /*
     * Do NOT silently make the user enter the Client ID
     * again when we already know it.
     *
     * Show the actual API error instead.
     */

    showConnectScreen();


    connectMessage.textContent =
      error instanceof Error
        ? error.message
        : String(
            error
          );

  }

}


/* =========================================================
   CLEAN OAUTH QUERY PARAMETERS
   ========================================================= */

function cleanOAuthParameters() {

  const url =
    new URL(
      window.location.href
    );


  url.searchParams.delete(
    "facebook_connected"
  );


  url.searchParams.delete(
    "pages_connected"
  );


  url.searchParams.delete(
    "client_id"
  );


  const cleanUrl =
    url.pathname +
    (
      url.search
        ? url.search
        : ""
    ) +
    (
      url.hash
        ? url.hash
        : ""
    );


  window.history.replaceState(
    {},
    document.title,
    cleanUrl
  );

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   EVENTS
   ========================================================= */

connectButton.addEventListener(
  "click",
  connectFacebook
);


refreshButton.addEventListener(
  "click",
  loadPages
);


/* =========================================================
   INITIALIZE APPLICATION
   ========================================================= */

async function initialize() {

  restoreClientId();


  const oauthSuccess =
    getQueryParameter(
      "facebook_connected"
    );


  const clientId =
    getClientId();


  /*
   * Facebook just redirected back successfully.
   *
   * Immediately show the connected-pages section while
   * client-pages is loading instead of showing the Client ID
   * form again.
   */

  if (
    oauthSuccess === "true" &&
    clientId
  ) {

    showPagesScreen();


    pagesList.innerHTML =
      `
        <div class="empty-message">
          Facebook connected successfully.
          Loading your Page...
        </div>
      `;

  }


  /*
   * Existing returning user with a saved Client ID.
   */

  else if (
    clientId
  ) {

    showPagesScreen();


    pagesList.innerHTML =
      `
        <div class="empty-message">
          Loading connected Pages...
        </div>
      `;

  }


  /*
   * Brand-new user.
   */

  else {

    showConnectScreen();

  }


  await loadPages();

}


/* =========================================================
   START
   ========================================================= */

initialize();
