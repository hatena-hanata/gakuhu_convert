<script>
    var chord_block = document.getElementsByClassName('code lang-c')[0];
    chord_block.addEventListener('click', autoscroll, false);

    var timerID;
    var scroll_flg = false;
    var speed = 100;

    function scroll(){
        window.scrollBy(0, 1);
    }

    function scrollSpeed(choice){
        speed = parseInt(choice.value) * 10;
     }

    function autoscroll(){
        if (scroll_flg == false){
            timerID = setInterval("scroll()", speed);
            scroll_flg = true;
        }
        else{
            clearInterval(timerID);
            scroll_flg = false;
        }
	}

    key_arr =  [
        {cd:"1", label:"半音下げ"},
        {cd:"0", label:"原曲キー"},
        {cd:"-1", label:"Capo 1"},
        {cd:"-2", label:"Capo 2"},
        {cd:"-3", label:"Capo 3"},
        {cd:"-4", label:"Capo 4"},
        {cd:"-5", label:"Capo 5"}
    ];

// キーとスピードの選択肢を作成
    for(var i=1;i<=10;i++){
        let op = document.createElement('option');
        op.value = String(i);
        if(i == 1){
            op.text = String(i) + '（はやい）';
        }
        else if(i == 5){
            op.text = String(i) + '（ふつう）';
            op.selected = true;
        }
        else if(i == 10){
            op.text = String(i) + '（ゆっくり）';
        }
        else {
            op.text = String(i);
        }
        document.getElementById("selSpeed").appendChild(op);
    }

    for(var i=0;i<key_arr.length;i++){
        let op = document.createElement("option");
        op.value = key_arr[i].cd;
        if(op.value == default_key){
            op.text = key_arr[i].label + ' （デフォルト）';
            op.selected = true;
        }
        else{
            op.text = key_arr[i].label;
        }
        document.getElementById("selStep").appendChild(op);
    }
        
    var first_flg = true;
    var chord_text = '';

    function isMultibyte(str){
        for(var i=0;i<str.length;i++){
            if(encodeURI(str.charAt(i)).length >= 4){
                return true;
            }
        }
        return false;
    }

    function isNotChord(text){
        if(text.length == 0){
            return true;
        }
        if(text == 'intro'){
            return true;
        }
        if(isMultibyte(text)){
            return true;
        }
        return false;
    }

    function transpose(text, step){
        const tone_arr_sharp = ['A', 'A#', 'B', 'C',  'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
        const tone_arr_flat = ['A', 'Bb', 'B', 'C',  'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];
        // Cなどメジャーコード
        if(text.length == 1){
            ans_index = (tone_arr_sharp.indexOf(text) + step + 12) % 12;
            return tone_arr_sharp[ans_index];
        }
        else if(text.charAt(1) == '#'){
            ans_index = (tone_arr_sharp.indexOf(text.slice(0, 2)) + step + 12) % 12;
            return tone_arr_sharp[ans_index] + text.slice(2);
        }
        else if(text.charAt(1) == 'b'){
            ans_index = (tone_arr_flat.indexOf(text.slice(0, 2)) + step + 12) % 12;
            return tone_arr_flat[ans_index] + text.slice(2);
        }
        else if(text.match('on')){
            tmp = text.split('on');
            root = tmp[0];
            base = tmp[1];
            return transpose(root, step) + 'on' + transpose(base, step);
        }
        else{
            ans_index = (tone_arr_sharp.indexOf(text.charAt(0)) + step + 12) % 12;
            return tone_arr_sharp[ans_index] + text.slice(1);
        }
        return text + 'あ';
    }

    function transpose_text(text, step){
        // 行ごとに区切る
        var arr_by_line = text.split(/\r\n|\n/);
        var transposed_arr = [];
        // 行ごとに処理
        for(var i=0;i<arr_by_line.length;i++){
            // コード以外
            if(isNotChord(arr_by_line[i])){
                transposed_arr.push(arr_by_line[i]);
            }

            // コード
            else{
                var transposed_arr_by_line = []; 
                var bar = arr_by_line[i];
                var chord_list = bar.split('/');

                for(var j=0;j<chord_list.length;j++){
                    if(chord_list[j].match(' ')){
                        chords = chord_list[j].split(' ');
                        let tmp = [];
                        for(var k=0;k<chords.length;k++){
                            ans = transpose(chords[k], step);
                            tmp.push(ans);
                        }
                        transposed_arr_by_line.push(tmp.join(' '));
                    }
                    else{
                        ans = transpose(chord_list[j], step);
                        transposed_arr_by_line.push(ans);
                    }
                }
                // 行を文字列に戻す
                transposed_arr.push(transposed_arr_by_line.join('/'));
            }

        }// end for

        // 配列を文字列に戻す
        return transposed_arr.join('\n');
    }

    function convert(choice){

        // 初回のコードを保存しておき、これを移動させる
        if(first_flg){
            chord_text = chord_block.innerText;
            first_flg = false;
        }
        // transpose幅を取得
        var step = parseInt(choice.value) - parseInt(default_key);
        
        // 変換する
        var transposed_text = transpose_text(chord_text, step);

        // 書き換え
        chord_block.innerHTML = transposed_text;
    }


</script>