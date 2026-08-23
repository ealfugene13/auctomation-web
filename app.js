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
   CLIENT ID
   ========================================================= */

function getClientId() {

  const inputValue =
    clientIdInput.value.trim();

  if (
    inputValue
  ) {

    localStorage.setItem(
      "auctomation_client_id",
      inputValue
    );

    return inputValue;

  }


  const queryClientId =
    getQueryParameter(
      "client_id"
    );

  if (
    queryClientId
  ) {

    localStorage.setItem(
      "auctomation_client_id",
      queryClientId
    );

    return queryClientId;

  }


  return localStorage.getItem(
    "auctomation_client_id"
  );

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
      "auctomation_client_id"
    );

  const clientId =
    queryClientId ||
    storedClientId;

  if (
    clientId
  ) {

    clientIdInput.value =
      clientId;

  }

}


/* =========================================================
   CONNECT FACEBOOK
   ========================================================= */

function connectFacebook() {

  const clientId =
    getClientId();

  if (
    !clientId
  ) {

    connectMessage.textContent =
      "Please enter your Client ID.";

    return;

  }


  connectMessage.textContent =
    "Redirecting to Facebook...";


  const url =
    new URL(
      CONFIG.FACEBOOK_OAUTH_START
    );


  url.searchParams.set(
    "client_id",
    clientId
  );


  /*
   * Optional return URL.
   *
   * We will update facebook-oauth-callback later
   * so that it redirects back here after OAuth.
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

    return;

  }


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


    const response =
      await fetch(
        url.toString(),
        {
          method:
            "GET",

          headers: {
            Accept:
              "application/json"
          }
        }
      );


    const result =
      await response.json();


    if (
      !response.ok ||
      result.success === false
    ) {

      throw new Error(
        result.error ||
        "Unable to load connected Pages."
      );

    }


    const pages =
      result.pages || [];


    if (
      pages.length === 0
    ) {

      pagesList.innerHTML =
        `
          <div class="empty-message">
            No Facebook Pages connected yet.
          </div>
        `;

      return;

    }


    connectSection.classList.add(
      "hidden"
    );


    pagesSection.classList.remove(
      "hidden"
    );


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
              page.connection_status ||
              page.status ||
              "CONNECTED"
            )}
          </div>
        `;


      pagesList.appendChild(
        element
      );

    }

  }
  catch (
    error
  ) {

    console.error(
      error
    );


    pagesList.innerHTML =
      `
        <div class="empty-message">
          ${escapeHtml(
            String(
              error.message ||
              error
            )
          )}
        </div>
      `;

  }

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(
  value
) {

  return String(
    value
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
   INITIALIZE
   ========================================================= */

restoreClientId();


const oauthSuccess =
  getQueryParameter(
    "facebook_connected"
  );


if (
  oauthSuccess ===
  "true"
) {

  connectMessage.textContent =
    "Facebook connected successfully.";

}


loadPages();
