// renderProducts function ke andar product image ko aisi tag banayein:
// <img src="${prod.img}" alt="Product" onclick="openImageZoom('${prod.img}', '${prod.name}')" style="cursor:pointer;" title="Click to Zoom">

function openImageZoom(imgUrl, prodName) {
    document.getElementById('zoomImageSrc').src = imgUrl;
    document.getElementById('zoomProductName').innerText = prodName;
    document.getElementById('imageZoomModal').style.display = 'block';
}

function closeZoomModal() {
    document.getElementById('imageZoomModal').style.display = 'none';
}
