const clientIdInput =
  document.getElementById(
    "clientId"
  );

const connectButton =
  document.getElementById(
    "connectFacebook"
  );

const reconnectButton =
  document.getElementById(
    "reconnectFacebook"
  );

const connectMessage =
  document.getElementById(
    "connectMessage"
  );

const pagesMessage =
  document.getElementById(
    "pagesMessage"
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
   BUILD FACEBOOK OAUTH URL
   ========================================================= */

function buildFacebookOAuthUrl(
  clientId
) {

  const url =
    new URL(
      CONFIG.FACEBOOK_OAUTH_START
    );


  url.searchParams.set(
    "client_id",
    clientId
  );


  /*
   * Useful for future callback handling.
   */

  url.searchParams.set(
    "return_url",
    window.location.origin +
    window.location.pathname
  );


  return url.toString();

}


/* =========================================================
   CONNECT FACEBOOK
   ========================================================= */

function connectFacebook() {

  const inputClientId =
    clientIdInput.value.trim();


  if (
    !inputClientId
  ) {

    connectMessage.textContent =
      "Please enter your Client ID.";

    return;

  }


  localStorage.setItem(
    CLIENT_STORAGE_KEY,
    inputClientId
  );


  connectButton.disabled =
    true;


  connectMessage.textContent =
    "Redirecting to Facebook...";


  window.location.href =
    buildFacebookOAuthUrl(
      inputClientId
    );

}


/* =========================================================
   RECONNECT FACEBOOK
   =========================================================
   
   This allows an already-connected client to run
   Facebook OAuth again so the stored Page access token
   can be refreshed with newly approved permissions.
   ========================================================= */

function reconnectFacebook() {

  const clientId =
    getClientId();


  if (
    !clientId
  ) {

    pagesMessage.textContent =
      "Client ID is missing. Please reconnect from the main screen.";

    showConnectScreen();

    return;

  }


  reconnectButton.disabled =
    true;


  refreshButton.disabled =
    true;


  pagesMessage.textContent =
    "Redirecting to Facebook to refresh your Page connection...";


  /*
   * Preserve client ID before leaving the website.
   */

  localStorage.setItem(
    CLIENT_STORAGE_KEY,
    clientId
  );


  window.location.href =
    buildFacebookOAuthUrl(
      clientId
    );

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


  clientIdInput.value =
    clientId;


  pagesList.innerHTML =
    `
      <div class="empty-message">
        Loading connected Pages...
      </div>
    `;


  pagesMessage.textContent =
    "";


  refreshButton.disabled =
    true;


  reconnectButton.disabled =
    true;


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


    const oauthSuccess =
      getQueryParameter(
        "facebook_connected"
      );


    if (
      oauthSuccess ===
      "true"
    ) {

      pagesMessage.textContent =
        "Facebook connection refreshed successfully.";

    }


    cleanOAuthParameters();

  }

  catch (
    error
  ) {

    console.error(
      "Unable to load connected Pages:",
      error
    );


    showConnectScreen();


    connectMessage.textContent =
      error instanceof Error
        ? error.message
        : String(
            error
          );

  }

  finally {

    refreshButton.disabled =
      false;


    reconnectButton.disabled =
      false;

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


reconnectButton.addEventListener(
  "click",
  reconnectFacebook
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
   */

  if (
    oauthSuccess ===
      "true" &&
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
   * Existing connected client.
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
   * New client.
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
