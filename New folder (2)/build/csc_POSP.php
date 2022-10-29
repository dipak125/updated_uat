<?php
$csc_id='500100100013';
$data = json_encode($csc_id);
$key = 'eTJmS3F6UlM5SVlSRG5sa1owOUF4dEpk';
$iv = openssl_random_pseudo_bytes(16);
$encrypted = openssl_encrypt($data, 'aes-256-gcm', $key, 0, $iv, $tag);
$dataEncrypted = base64_encode($encrypted . '::' . base64_encode($iv) . '::' . base64_encode($tag));

header('Location: https://uatcld.sbigeneral.in/sbig-bc/uat/index.php#/login?csc_id='.$dataEncrypted.'&type=POSP');

?>