function showSearchSuggestions() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let box = document.getElementById('searchSuggestionsBox');
    box.innerHTML = '';
    
    if(input.length === 0) {
        box.style.display = 'none';
        return;
    }

    let matches = products.filter(p => p.name.toLowerCase().includes(input) || p.category.toLowerCase().includes(input));

    if(matches.length > 0) {
        box.style.display = 'block';
        matches.forEach(m => {
            box.innerHTML += `<div class="suggestion-item" onclick="selectSuggestion('${m.name}')">${m.name} <span style="font-size:11px; color:#888;">(${m.category})</span></div>`;
        });
    } else {
        box.style.display = 'block';
        box.innerHTML = `<div class="suggestion-item" style="color:#888;">No products found</div>`;
    }

    // Run filter simultaneously
    renderProducts(matches);
}

function selectSuggestion(name) {
    document.getElementById('searchInput').value = name;
    document.getElementById('searchSuggestionsBox').style.display = 'none';
    let filtered = products.filter(p => p.name.toLowerCase() === name.toLowerCase());
    renderProducts(filtered);
}

// Click outside to close suggestion box
document.addEventListener('click', function(e) {
    if(!e.target.closest('.search-container')) {
        let box = document.getElementById('searchSuggestionsBox');
        if(box) box.style.display = 'none';
    }
});
