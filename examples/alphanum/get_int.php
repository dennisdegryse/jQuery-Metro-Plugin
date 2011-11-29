<?php
/**
 * This piece of PHP code returns an array of JSON objects that contain two
 * fields (type, number).
 */
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 14 Mar 1994 00:00:00 GMT');
header('Content-type: application/json');

$records = array();
$n = 0;

while ($n++ < 200)
    $records[] = (object)array('type' => 'int', 'number' => $n);

echo json_encode($records);
