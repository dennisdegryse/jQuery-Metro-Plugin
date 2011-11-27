<?php
/**
 * This piece of PHP code returns an array of JSON objects that contain a single
 * field (number).
 */
$pivot = $_GET['pivot'];
$count = $_GET['count'];
$records = array();

if ($pivot == 'null')
    $pivot = 0;
else
    $pivot = $pivot['number'];

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 14 Mar 1994 00:00:00 GMT');
header('Content-type: application/json');

if ($count > 200)
    header('HTTP/1.1 417 Expectation Failed');
else
    while ($count--) {
        $pivot++;
        $records[] = (object)array('number' => $pivot);
    }

echo json_encode($records);
