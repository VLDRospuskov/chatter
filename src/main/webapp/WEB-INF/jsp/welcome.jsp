<HTML>
<HEAD>
    <TITLE>Second page</TITLE>

    <script type="text/javascript"
            src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
    <script>
        $(document).ready(
            function() {
                setInterval(function() {
                    var name = "SECOND MESSAGEE!!!!!!!!!!!!!!";
                    $('#show').text(name);
                }, 3000);

                var name2 = "FIRST!!!";
                $('#show').text(name2);
            });
    </script>

</HEAD>
<BODY>
<br>
<br>
<div id="show" align="center"></div>
</BODY>
</HTML>