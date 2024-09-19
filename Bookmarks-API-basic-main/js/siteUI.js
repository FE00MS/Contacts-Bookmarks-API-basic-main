//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderBookmarks();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
       renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

let selectedCategory = ""; 
 
function updateDropDownMenu(categories) { 
    let DDMenu = $("#DDMenu"); 
    let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw"; 
    DDMenu.empty(); 
    DDMenu.append($(` 
        <div class="dropdown-item menuItemLayout" id="allCatCmd"> 
            <i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories 
        </div> 
        `)); 
    DDMenu.append($(`<div class="dropdown-divider"></div>`)); 
    categories.forEach(category => { 
        selectClass = selectedCategory === category ? "fa-check" : "fa-fw"; 
        DDMenu.append($(` 
            <div class="dropdown-item menuItemLayout category" id="allCatCmd"> 
                <i class="menuIcon fa ${selectClass} mx-2"></i> ${category} 
            </div> 
        `)); 
    }) 
    DDMenu.append($(`<div class="dropdown-divider"></div> `)); 
    DDMenu.append($(` 
        <div class="dropdown-item menuItemLayout" id="aboutCmd"> 
            <i class="menuIcon fa fa-info-circle mx-2"></i> À propos... 
        </div> 
        `)); 
    $('#aboutCmd').on("click", function () { 
        renderAbout(); 
    }); 
    $('#allCatCmd').on("click", function () { 
        selectedCategory = ""; 
        renderBookmarks(); 
    }); 
    $('.category').on("click", function () { 
        selectedCategory = $(this).text().trim(); 
        renderBookmarks(); 
    }); 
} 

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de contacts</h2>
                <hr>
                <p>
                    Petite application de gestion de contacts à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Loïc Lompo
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2024
                </p>
            </div>
        `))
}

async function renderBookmarks(){
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await  API_GetBookmarks();
    eraseContent();
    if (bookmarks !== null ) {
        bookmarks = sortBookmarks(bookmarks); //Trie A,B,C
       bookmarks.forEach(bookmark => {
        if (selectedCategory === "" || bookmark.Category === selectedCategory) {
            $("#content").append(renderBookmark(bookmark));
        }
       });
       restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $(".bookmarkRow").on("click", function (e) { e.preventDefault(); })
        let categories = getCategorie(bookmarks); 
        categories = sortCategories(categories); //Trie A,B,C
        updateDropDownMenu(categories);
   } else {
       renderError("Service introuvable");
   }
   
}
function sortBookmarks(bookmarks) {
    return bookmarks.sort((a, b) => a.Title.localeCompare(b.Title));
}
function sortCategories(categories) {
    return categories.sort((a, b) => a.localeCompare(b));
}

function getCategorie(bookmarks){
    let categories = new Set();
    bookmarks.forEach(bookmark => {
        if (bookmark.Category) {
            categories.add(bookmark.Category);
        }
    });
    return Array.from(categories);
}
   function renderBookmark(bookmark) {
    const faviconUrl = getFaviconUrl(bookmark.Url);
    return $(`
     <div class="bookmarkRow" bookmark_id="${bookmark.Id}">
        <div class="bookmarkContainer noselect">
            <div class="bookmarkLayout">
            <div class="bookmarkTitleContainer">
                <span ><img src="${faviconUrl}" alt="${bookmark.Title} favicon" class="favicon"></span>
                <span class="bookmarkTitle">${bookmark.Title}</span>
                </div>
                <span class="bookmarkCategory"><a href="${bookmark.Url}" target="_blank">${bookmark.Category}</a></span>
            </div>
            <div class="bookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editbookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deletebookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
            </div>
        </div>
    </div>           
    `);
}

function getFaviconUrl(url) {
    const domain = (new URL(url)).origin;
    return `${domain}/favicon.ico`;
}

function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}

function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await API_GetBookmark(id);
    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("bookmark introuvable!");
}


async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await API_GetBookmark(id);
    eraseContent();
    if (bookmark !== null) {
        const faviconUrl = getFaviconUrl(bookmark.Url);
        $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Effacer le favori suivant?</h4>
            <br>
            <div class="bookmarkRow" bookmark_id="${bookmark.Id}">
        <div class="bookmarkContainer noselect">
            <div class="bookmarkLayout">
            <div class="bookmarkTitleContainer">
                <span ><img src="${faviconUrl}" alt="${bookmark.Title} favicon" class="favicon"></span>
                <span class="bookmarkTitle">${bookmark.Title}</span>
                </div>
                <span class="bookmarkCategory"><a href="${bookmark.Url}" target="_blank">${bookmark.Category}</a></span>
            </div>
            <div class="bookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editbookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deletebookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
            </div>
        </div>
    </div>      
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteBookmark(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Favoris introuvable!");
    }
}


function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.Url = "";
    bookmark.Category = "";
    return bookmark;
}


function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
  
    $("#actionTitle").text(create ? "Création" : "Modification");
    if(bookmark != null){
        const faviconUrl = getFaviconUrl(bookmark.Url);
        $("#content").append(`
            <form class="form" id="bookmarkForm">
                <input type="hidden" name="Id" value="${bookmark.Id}"/>
                <span class="faviconContainer" ><img src="${faviconUrl}" alt="${bookmark.Title} favicon" class="faviconEdit"></span>
                <label for="Title" class="form-label">Titre</label>
                <input 
                    class="form-control Alpha"
                    name="Title" 
                    id="Title" 
                    placeholder="Titre"
                    required
                    RequireMessage="Veuillez entrer un titre"
                    InvalidMessage="Le titre comporte un caractère illégal" 
                    value="${bookmark.Title}"
                    
                />
                <label for="Url" class="form-label">Url </label>
                <input
                    class="form-control Url"
                    name="Url"
                    id="Url"
                    placeholder="Url"
                    required
                    RequireMessage="Veuillez entrer votre url" 
                    InvalidMessage="Veuillez entrer un url valide"
                    value="${bookmark.Url}" 
                />
                <label for="Category" class="form-label">Categorie </label>
                <input 
                    class="form-control Category"
                    name="Category"
                    id="Category"
                    placeholder="Categorie"
                    required
                    RequireMessage="Veuillez entrer votre categorie" 
                    InvalidMessage="Veuillez entrer une categorie valide"
                    value="${bookmark.Category}"
                />
                <hr>
                <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
                <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
            </form>
        `
   ); }else{
    if (create) bookmark = newBookmark();
    $("#content").append(`
        <form class="form" id="bookmarkForm">
            <img  class="logoEdit" src="bookmark-logo.svg"  alt="" title="Gestionnaire de favoris">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>
            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control Url"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer votre url" 
                InvalidMessage="Veuillez entrer un url valide"
                value="${bookmark.Url}" 
            />
            <label for="Category" class="form-label">Categorie</label>
            <input 
                class="form-control Category"
                name="Category"
                id="Category"
                placeholder="Categorie"
                required
                RequireMessage="Veuillez entrer votre categorie" 
                InvalidMessage="Veuillez entrer une categorie valide"
                value="${bookmark.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    }
    
    initFormValidation();
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await API_SaveBookmark(bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}


