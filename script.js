window.addEventListener("load", function () {
    updateCartView();
    handleDialog();
    getAllProductForms('.formProduct');
    changeDisplayProductImage();
    cartPayment();
});

function isNullEmptyOrUndefined(variable) {
    return (typeof variable === 'undefined' || variable === null || variable === '');
}

function handleDialog() {
    const dialogs = document.querySelectorAll('.dialog');
    dialogs.forEach(function (dialog) {
        const dialogContainers = dialog.querySelectorAll('.dialogContainer');
        const dialogButtons = dialog.querySelectorAll('.toggleDialog');
        dialogButtons.forEach(function (dialogButton) {
            dialogButton.addEventListener('click', function (e) {
                e.preventDefault();
                dialogContainers.forEach(function (dialogContainer) {
                    dialogContainer.classList.contains("openDialog")
                        ? dialogContainer.classList.remove("openDialog")
                        : dialogContainer.classList.add("openDialog");
                });
            })
        });
    });
}

function cartPayment(){
    const cartPayButton = document.getElementById('cartPayButton');
    cartPayButton.addEventListener('click', function (e) {
        e.preventDefault();
        const cartFromLocalStorage = getLocalStorageCart();
        const cartContent = JSON.stringify(cartFromLocalStorage);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/', true);
        xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
        xhr.send(cartContent);
        alert("Vous pouvez ouvrir l'inspecteur pour voir le contenu de la requête.");
    })
}

function changeDisplayProductImage() {
    const productImagesContainer = document.querySelectorAll(".productImage");
    productImagesContainer.forEach(function (productImageContainer) {
        const productThumbnailsContainer = productImageContainer.querySelector(".productThumbnails");
        if(!isNullEmptyOrUndefined(productThumbnailsContainer)){
            const productImage = productImageContainer.querySelector("img");
            const productThumbnails = productThumbnailsContainer.querySelectorAll("img");
            productThumbnails.forEach(function (productThumbnail) {
                const productThumbnailSrc = productThumbnail.getAttribute('src');
                productThumbnail.addEventListener("click", function (e) {
                    e.preventDefault();
                    productImage.setAttribute('src', productThumbnailSrc);
                })
            });
        }
    })
}

function getAllProductForms(formProductClass){
    let formsProduct = document.querySelectorAll(formProductClass);
    formsProduct.forEach(function (form){
        form.addEventListener("submit", function(e){
            e.preventDefault();
            changeProductImage(form);
            const cart = getLocalStorageCart();
            const product = {};
            const formData = new FormData(form);
            const formEntries = formData.entries();
            for(let formValue of formEntries) {
                // formValue est un tableau de deux éléments,
                // le premier étant le nom de la donnée,
                // le second la valeur de la donnée.
                product[formValue[0]] = formValue[1];
            }

            // parse le prix en décimale
            product.productPrice = parseFloat(product.productPrice);
            // parse la quantité en entier
            product.productQuantity = parseInt(product.productQuantity);

            addProductToCart(cart, product);
            updateLocalStorageCartAndView(cart);
        });
    });
}

function addProductToCart(cartArray, productObject) {
    if(cartArray.length > 0){
        if(productIsAlreadyInCart(cartArray, productObject.productId, productObject.productColor)){
            updateProductQuantity(cartArray, productObject.productId, productObject.productColor, productObject.productQuantity);
        } else{
            cartArray.push(productObject);
        }
    } else{
        cartArray.push(productObject);
    }
}

function updateCartView() {
    const cart = getLocalStorageCart();
    const cartEmpty = document.getElementById('cartEmpty');
    const cartPayButton = document.getElementById('cartPayButton');
    const cartProductsList = document.getElementById('cartList');
    const cartBadge = document.getElementById('cartBadge');
    const cartProducts = document.getElementsByClassName("cartProduct");
    if (!isNullEmptyOrUndefined(cartProductsList)){
        cartProductsList.remove();
    }

    const cartContent = document.getElementById("cartContent");
    const productsList = document.createElement("ul");
    productsList.setAttribute('id', 'cartList');
    productsList.classList.add("cartList");
    cartContent.appendChild(productsList);
    addProductInCart(cart, productsList);

    if (cartProducts.length > 0){
        cartPayButton.classList.remove('disabled');
        cartBadge.classList.add('shaking');
        setTimeout(function(){
            cartBadge.classList.remove('shaking');
        }, 1000);
        cartBadge.textContent = cartProducts.length.toString();
        cartEmpty.style.display = "none"
    }
    else{
        cartPayButton.classList.add('disabled');
        cartBadge.textContent = "";
        cartEmpty.style.display = "flex"
    }

}

function addProductInCart(cartArray, productsContainerInCart){
    cartArray.forEach(function (product) {
        const productDisplay = document.createElement("li");
        productDisplay.setAttribute("id", product.productId + "InCart");
        productDisplay.classList.add("cartProduct");
        productDisplay.innerHTML =
            "<div class='cardTop'>" +
                "<div class='cartProductImage'>" +
                    "<img alt='" + product.productName + "' src='img/" + product.productImage +"'/>" +
                "</div>" +
                "<div class='cartProductTitle'>" +
                    "<span class='cartProductName'>" + product.productName + " - " + product.productColor + "</span>" +
                    "<span class='cartProductInfos'>Prix unitaire : <span class='importantInfo'>" + product.productPrice + "€</span></span>" +
                    "<span class='cartProductInfos'>Quantité : <span class='importantInfo'>" + product.productQuantity + "</span></span>" +
                "</div>" +
            "</div>" +
            "<div class='cardMiddle'>" +
                "<p class='cartProductDescription'>" + product.productDescription + "</p>" +
            "</div>" +
            "<div class='cardBottom'>" +
                "<button class='iconButton addIcon colored' title='Ajouter' onclick='changeProductQuantityInCart(this)' data-productid='" + product.productId + "' data-productcolor='" + product.productColor + "' data-productquantity='" + product.productQuantity + "' value='1'></button>" +
                "<button class='iconButton removeIcon colored' title='Retirer' onclick='changeProductQuantityInCart(this)' data-productid='" + product.productId + "' data-productcolor='" + product.productColor + "' data-productquantity='" + product.productQuantity + "' value='-1'></button>" +
                "<button class='iconButton deleteIcon' title='Supprimer' onclick='removeProductInCart(this)' data-productid='" + product.productId + "' data-productcolor='" + product.productColor + "'></button>" +
            "</div>"
        ;
        productsContainerInCart.appendChild(productDisplay);
    });
}

function changeProductImage(form) {
    const productId = form.querySelector(".productIdInput");
    const productImage = form.querySelector(".productImageInput");
    const productColor = form.querySelector(".productColorSelect");
    productImage.value = productId.value + "_" + productColor.value + ".png";
}

function removeProductInCart(element) {
    let cart = getLocalStorageCart();
    const productId = element.dataset.productid;
    const productColor = element.dataset.productcolor;
    cart = deleteProduct(cart, productId, productColor);
    updateLocalStorageCartAndView(cart);
}

function changeProductQuantityInCart(element){
    let cart = getLocalStorageCart();
    const productId = element.dataset.productid;
    const productColor = element.dataset.productcolor;
    const productQuantity = parseInt(element.dataset.productquantity);
    const incrementQuantityValue = parseInt(element.value);
    (productQuantity + incrementQuantityValue) > 0
        ? updateProductQuantity(cart, productId, productColor, incrementQuantityValue)
        : cart = deleteProduct(cart, productId, productColor);
    updateLocalStorageCartAndView(cart);
}

function productIsAlreadyInCart(cartArray, productId, productColor) {
    return cartArray.some(product => (product.productId === productId && product.productColor === productColor));
}

function updateProductQuantity(cartArray, productId, productColor, productQuantity) {
    cartArray = cartArray.find(product => (product.productId === productId && product.productColor === productColor));
    return cartArray.productQuantity += productQuantity;
}

function deleteProduct(cartArray, productId, productColor) {
    return cartArray.filter(product => (product.productId !== productId || product.productColor !== productColor));
}

function updateLocalStorageCartAndView(cartArray){
    localStorage.setItem('cart', JSON.stringify(cartArray));
    updateCartView();
}

function getLocalStorageCart() {
    return localStorage.getItem('cart') !== null
        ? JSON.parse(localStorage.getItem('cart'))
        : [];
}
