
function handleTab(){
    var id = "preview";
    if (location.hash !== ''){
        var be = location.hash.split('?');
        if(be.length>1) {
            id = be[be.length - 1];
            $('a[data-target=#' + id + ']').tab('show');
        }
    }

    // add a hash to the URL when the user clicks on a tab
    $('a[data-toggle="tab"]').on('click', function(e) {
        history.pushState(null, null, $(this).attr('href'));
    });

    // navigate to a tab when the history changes
    window.addEventListener("popstate", function(e) {
        var activeTab = '';
        if (location.hash !== ''){
            var be = location.hash.split('?');
            id = be[be.length-1];
            activeTab = $('a[data-target=#' + id + ']');
        }

        if (activeTab.length) {
            activeTab.tab('show');
        } else {
            $('.nav-tabs a:first').tab('show');
        }
    });

    $(document).scrollTop(0);
}
