function openReferModal() {
    closeLoginModal();
    document.getElementById('referModal').style.display = 'block';
    let randomCode = 'SALE' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('referralLinkText').innerText = `https://sale11store.com/?ref=${randomCode}`;
}

function closeReferModal() {
    document.getElementById('referModal').style.display = 'none';
}

function shareReferralLink() {
    let link = document.getElementById('referralLinkText').innerText;
    if (navigator.share) {
        navigator.share({
            title: 'Sale 11 Refer & Earn',
            text: `Shop on Sale 11 using my referral link and get special discounts!`,
            url: link,
        }).catch(() => {});
    } else {
        alert('Referral link copied to clipboard! Share it with your friends.');
    }
}
