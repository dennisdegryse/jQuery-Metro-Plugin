<?php
/**
 * This piece of PHP code returns an array of JSON objects that contain two
 * fields (type, alpha).
 */
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 14 Mar 1994 00:00:00 GMT');
header('Content-type: application/json');

$records = array();
$a = '';
$count = 200;

function increment($str, $partial = '') {
    if ($str == '')
        return 'A' . $partial;

    $head = substr($str, 0, strlen($str) - 1);
    $tail = $str[strlen($str) - 1];

    if ($tail == 'Z') {
        return increment($head, 'A' . $partial);
    } else
        return $head . chr(ord($tail) + 1) . $partial;
}

while ($count--) {
    $a = increment($a);

    $records[] = (object)array('type' => 'alpha', 'alpha' => $a);
}

echo json_encode($records);
