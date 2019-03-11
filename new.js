var firebase = require('firebase');
var sortBy = require('sort-by');
var moment = require('moment');
var unique = require('array-unique');

// Initialize Firebase
var appConfig = {
  apiKey: "AIzaSyDikBnf9yHLmGY4jIovJnKGJ7XOfaxI4m4",
  authDomain: "bucket1-bc82b.firebaseapp.com",
  databaseURL: "https://bucket1-bc82b.firebaseio.com",
  projectId: "bucket1-bc82b",
  storageBucket: "bucket1-bc82b.appspot.com",
  messagingSenderId: "758565469890"
};

var app = firebase.initializeApp(appConfig);
var secondapp = firebase.initializeApp(appConfig, "Secondary");

var positivedb = firebase.database();
var root = positivedb.ref();
var transferdb = positivedb.ref('Transfer');
var positiondb = positivedb.ref('Encuestas');
var accountdb = positivedb.ref('Cuenta');
var persondb = positivedb.ref('Personas');

var info = {
  transfer: {},
  account: {},
  entity: {},
  person: {}
};

var array = ["-LQuSUlLPI5EL06OCprz", "-LTd6qyY6CtfhrbS6SGq", "-LVoLw1kQJ0Vvxk2PC9l", "-LWlSfqza4JL_VWjeg_a", "-LXKnv0S4kJRzLh6udNk", "-LXL1LL1oadIe4jEEUm7", "-LXLGQLE3tmhQKiR8SQe", "-LXZzSDx3vrmxkewKi8n", "-LZ0JvMU6HB6JZCd1oaR", "-LZ0NwGAtbrGDc_evY-5", "-LZ0IdR_xPvf7i7vDBVj", "-LYgjHFntakMvDv6UjB9", "-LYgzXu1FMSnAseoSQ8E", "-LZ0TxsLXfZqIi0vDAPT", "-LZ0_XEjvUw_pWAvRYWY", "-LZ0_6D0THoRcs8n6cMv", "-LZ0aWBXUsS66b37EeXC", "-LZ0gvpxMw7XsRKiEnDT", "-LZ0jIu0-UNJInOCRTIm", "-LZ0smW4M5L8dOHqYyDx", "-LZ0tDtwS6rV9dkJEbuM", "-LZ14EAYyvYT9z5fu86m", "-LZ16ebpg8fQ5iSPSCit", "-LZ1II8BIdFY9L0tjy9L", "-LZ1IK7IpHjiHl1a-wOB", "-LZ1N_UaFYHZH37PEkk2", "-LZ1V6XHkXxM7i695aW0", "-LZ1b8__hQnp9qqcGKU5", "-LZ1ghlfdxdZY5Cy8WNo", "-LZ1v6_YOImIoflemLgH", "-LZ2inQA2y-WJ91dPWTs", "-LZ5RJw068vRbM5S-SOv", "-LZ5XmuU5aRPjgY6IrPN", "-LZ5iXIoZnaEhWSxi3Qe", "-LZ5pdVmInO-bmyl-bps", "-LZ5sYGMiNePd6084BkJ", "-LZ5vWUiVA9dIkPw92Wz", "-LZ5zEv8y8CDn8uscmeE", "-LZ60D9JR6BBdzpnm303", "-LZ64SEyVbiqGKX-osbp", "-LZ64mIjVJBsN556tTUm", "-LZ6A7CZBMAoa1pSXIyv", "-LZ6Est6D22_kexJpa2L", "-LZ6JnKTUwAoj0LUOfM-", "-LZ6R0xBkzv3Q8BLn5N2", "-LZ6TiMx2j6HsIMoOd04", "-LZ6ShthSY3VCPPxkqpN", "-LZ6bdQIY2KBBvX95M-B", "-LZ6Zw6ElQGph5z8_3fm", "-LZ6i6KEqGN5Y_bx0rZB", "-LZ6qJ3wkJSWPv5_EDdX", "-LZ6relR7f1jGJLairg-", "-LZ6wuQALqFnUw5BHVYh", "-LZ5P2Ppob7LjEkwnuNj", "-LY9BWd06i9po2zmadBa", "-LZ7DEGayAL8LnVFH805", "-LZAWg8k4tzW9Vv8BxJb", "-LZAaa166Al_34iHVeqK", "-LZAgRokVktakad2A5A6", "-LZAi7N5V9j-ysOVj9Dm", "-LZAqJALBiTfvals3voG", "-LZAz80jIc7IKBl_t0Lp", "-LZB04yKgfgvNkp5q_X8", "-LZB4cMDDqfCb5t-W-7k", "-LZB5fKuoWEdXaBB--gk", "-LZBEQJvY3Y7_bJDfJBw", "-LZBGr2NyJnOrZsLyhyb", "-LZBGVTlBTS9pTULzIrT", "-LZBKMKnMAjSjQcj_Js9", "-LZBOIF-RJVWTfYqXUnr", "-LZBQq5io3w3sQzlkPy9", "-LZBddWXD5uhf4OhXK6x", "-LZBlHZ9Me6d4G3RHRzE", "-LZBmcuJg2AlynFz0U6Z", "-LZBsUCbocbhMTq9PvA7", "-LZBsER7mCA_Ox6SSzIw", "-LZBuC-asS5olrxN5TY8", "-LZC0H5q9c58Fp68XmEm", "-LWlxdKyUACHrVN0jVdu", "-LWm9nuJdUIFmfDlANa2", "-LWmLgUiGx683otLnTdM", "-LZFimoE36ereen5VB3u", "-LZFpbcWVuMzj0yn_l67", "-LZFszXEsYgYFNYK7XO7", "-LZFyZwZH9wzlPox5Mnx", "-LZG2ks3BHSjKnO_Iif3", "-LZG6G-oO4QLeVGNnM3D", "-LZG4JCjdIGIfV-CjPgx", "-LZG3efiJgRwlonqterq", "-LZGA99PX-vPxEJ1E4ea", "-LZGCU3ZlbWhUUEF7IH-", "-LZGLZuHuOcjRd1eBbtA", "-LZGQOVym3LSumlmc0p6", "-LZGSbtNFD174g5Eo6MW", "-LZGdJGdjgaekeP8C-tN", "-LZGen_5nPO7KYNrcgCh", "-LZGpS9ljgmpBa9DcEpQ", "-LZHG65OPquJNrbPwsTH", "-LZHKGCUwUrryr847nt7", "-LZHVsimVx4D5Gca4fEs", "-LZKp-TaIJbyEJfZ5j42", "-LZL1JspcwqDejtgF9zF", "-LZL3vqpls88y_l081VQ", "-LZL4YnKTaSZC_jwdRSO", "-LZL6rNRk0_NUaD1DhGJ", "-LZL5xhqP3MWKM6UrOBi", "-LZL9owBwt2ivPwqF7vr", "-LZLBbB2vyMMmMSeIy57", "-LZL6pWU0QwiikwFwEeS", "-LZLCJ8jvmSU-AnhBKUD", "-LZL9FRF_X36ME2EBgF0", "-LZLDah8CD8RLymvPCkr", "-LZL8kgEWTAnp0DQOJqc", "-LZLFv6muxdHfitBg5tY", "-LZLGLtN031-MVoMYVyD", "-LZLHNo4LRNLrxqSdb3p", "-LZLBHefCWTg2_bJoGj6", "-LZLG02YUtlRKEUlpF7v", "-LZLK6zHuuKvMOgKvBOj", "-LZLHemLFFf0hP8lh0m3", "-LZLKi_no3v1Bs2hefMf", "-LZLN5a-kOBV2Cjbeoux", "-LZLO9wmE-Zsm5jNincv", "-LZLPVA-fi2SG3AEWGDY", "-LZLSIeHmqnBlvp4M0E9", "-LZLSbh-5J6r4om2fGNA", "-LZLSKKJ32YYLSLVTgTm", "-LZLWjO9HVEvoLFJ5MQo", "-LZLYP_1yytfY9iJmnUA", "-LZL_AW7Y6AresGzJOSv", "-LZLZSZpzLSoUofaC9hT", "-LZLavV43i032MWuWJhI", "-LZLf-b6JqGlrmUWy2WL", "-LZLg39OgIW485_30N2M", "-LZLpoh9i418N6VdYhEp", "-LZLhbc6c1hghDr4miHN", "-LZLr89yFcDBJVUibZRL", "-LZLuqBjcafVSHoJIxxJ", "-LZPvQ5k9qCoygZAYPwy", "-LZQ5ueeD-a4TkFb-Nnn", "-LZQHjQ6JwWtOR6lAGeA", "-LZQaMTiuFJs-u512TQw", "-LZV_kBvmBq5FuKvx5iB", "-LZ_8yrjCS1XGG7FeUkJ", "-LZ_GfVv3mvhikwkM0YZ", "-LZ_M5EVSqib5p24CJZo", "-LZ_RwEZ7zB9QQEoTnrP", "-LZ_QW0ep09_15FjmLSl", "-LZ_YxfuGrPE7WwJBSHC", "-LZ_bDTgibrG0-JxbmiB", "-LZ_aERnbPuZjw4kEbqL", "-LZ_c2er_Im-7e-RA0pT", "-LZ_mWg09jjBgoy8MDer", "-LZ_nBIaNZFJhqZHPgkA", "-LZ_r2TOG5qE68vrm7vw", "-LZ_q2qiTZgGoedRmOW7", "-LZ_yLMMtI20SrdqdXXn", "-LZaNPLvaHetdH1-TFBJ", "-LZaW0kcYKdgMXRhVNrp", "-LZaXJ1NqTrGS3cMGGWh", "-LZabkU3Y_2I9abJwZVj", "-LZadtUGBp-dTd6W5Pal", "-LZaltZWPB7zt6ufdw7b", "-LZan_Kp30O4B4U249yq", "-LZaoEGM62aANoMQ1j7f", "-LZblAx-qu5B_EBMQCRs", "-LVu4RVqGwNVxYnDQ-nL", "-LWCk0IqqPD6MGzQ-roF", "-LWD4DGyhNxBY29FJUQF", "-LWD9M5-I51L3vHR0K67", "-LWIYX7D-U5VtNr2Z-2p", "-LWIkOySrWBmKfMo7jdx", "-LWItwd2VhZypFZIsBpS", "-LWM4SIpmjYk6c2gJK7K", "-LWMBEl2ACsZ7f2kYH4d", "-LX_FI1QQ1atw93esqbZ", "-LXdvx99PSagaXopWBoz", "-LXePs1FB8Y7XD71-PxA", "-LXemI4fevbJWslF6v6L", "-LXtDmxtzgRMvjSt7Fkt", "-LXtqDy8e8tGdVeZMPzy", "-LXy4BIjbymZAKM4fEMV", "-LXyCF-MqyeGrui3XWbH", "-LXyba2GP9ZA66hnsXvp", "-LXz5QT-wTtVbqki49iV", "-LY2RD-skLe7_zJ0v6V1", "-LY3-loS6sVDjw1gv4Tn", "-LY7XMkSYUOu1bZACVR_", "-LY83ogjw-vG0wi00mjI", "-LY8v_OidiSbkT_NWPSt", "-LYDGXA6575mC6xeO2n-", "-LYXxPQKQSOxP4WAlYpR", "-LYY2eMeUNPNs6-mWy4_", "-LYY8K4u419C1NpLXKkk", "-LYYSBps3LKXvHg5795F", "-LYYYmisyiizt2z6Ey-u", "-LZeJx153Yd0k2s6AtcR", "-LZeNDgW1HYptr3kIDg_", "-LZeJUzUnUw2-be2x92Y", "-LZePb0ZEHAe8XSvhEhQ", "-LZeRSt7ORqqKvrX40yr", "-LZeXaE7DRR0pE6C8CkJ", "-LZeaNw-0cZTNxloAXwl", "-LZefRxLwwwmqFtTlFb3", "-LZecwuLuNZTOVRlsMQq", "-LZQSs_U6OnTwdHUOja5", "-LZepEoFPcB3JUiMWmqG", "-LZepgOwjH3zfrphFYgJ", "-LZev1W2QwH5RED9Pod3", "-LZevTCfPjEyKbYNlEJ0", "-LZerapd62fXPpI3Rl1h", "-LZf0MkXe0DzmH2YDbY2", "-LZf5C-C3HJerDgvGRZa", "-LZfCBqe0iROB3O3aq-7", "-LZf8e692CofIv2PoqpJ", "-LZfGzqNUoiEOytQs79o", "-LZfNylAtiU9dEHEougY", "-LZfKKfJuSkCtHozvPp0", "-LZfPGtQT3XSzhZ0LoQe", "-LZfQD5woalwtcZ57fAz", "-LZfRYm3R1iEDonEUCn7", "-LZfWK1LWQXR2QV7aNi8", "-LZfYRaMVpz77Pyi_b1P", "-LZfOLf8Gvd7qSY7aRu3", "-LZfbMIgRl0Vg5IR210v", "-LZfcoxt3g3a7Jj68Smf", "-LZfdxBB6Y12_y3GaubN", "-LZflhvI9bACCKLmRzRM", "-LZg-lM1q_TmAnvh3d4S", "-LZjPYaUkksYMu-QaA1N", "-LZjSAVXWsHGDaIIdajz", "-LZjOqDwb3NLKsXHbOn3", "-LZjbeyXR-slZFBrKAbQ", "-LZjhm1z8LIHJGtm98UI", "-LZjgYRkFsz5fal6p0QB", "-LZjqklIcf3u1-gxkvSM", "-LZjrpxSRKxCu09FwIrj", "-LZjv34pzAvET-wRuYe9", "-LZjtIYzRS-AKMv1NwWq", "-LZk04bnI-lAX2urtUse", "-LZk1A26los6Z_2Nwc3z", "-LZk3h8BW4R7Q6ELkAGD", "-LZk0WLQBMmHe4at9EHF", "-LZk3b7qWSe-GPK7JX6u", "-LZk6Ft-10BZ2fBaKH98", "-LZk7o67ZubcGhHHlmI8", "-LZkCRzMUHE-V2bFr-BE", "-LZkFZO_rQoOCSQfl6k0", "-LZkFg3H_QdrusqC3DDS", "-LZkI53Eh9bc5BRdvLsP", "-LZkIfElEUxrN4tiWTB5", "-LZkNYW6OZ43CLI2vJOQ", "-LZkWCwEVrJ4B4jAL4Zy", "-LZkXfzudKmmg26YOZR-", "-LZkZBhO0jra7YG5Q98c", "-LZkgvvkNinwQBMXEt4S", "-LZkpY_w4eEKJ4g4r2k3", "-LZl-NpbYCaUuYPc6PIa", "-LZl6Nb53ov1GeUfMpST", "-LZlDPfb662YfmxKmKrt", "-LZlMtMQGY1ViYH32M3J", "-LZohH8J32_rpSzM8lhr", "-LZol3y78oAhazxTuEaI", "-LZox7OLZ5FW_giHSEsG", "-LZoyiQ9RY6O8ENOBT_0", "-LZozHtZItuPraIIevQr", "-LZp0gdVPs6cduYNuzXq", "-LZp1LuqzMRKHX9yJxMQ", "-LZp4sbNfcFRzFAHY__T", "-LZp5Dbu2Otv__4oOeuL", "-LZp7Z38IwbyYUkeKLmY", "-LZpDHqTKXsk6zVnf_Rq", "-LZpBeOykUofOacMWvWm", "-LZpCfTT6dPta1C7E-vc", "-LZpH3ruvAuKIYMSUw7J", "-LZpJ8RJ8i_hcZ79ij8p", "-LZpI_HaLUEXExxskWdJ", "-LZpKv6QK-ylwGfwdrPx", "-LZpMYmVpE0p49Sy_lGu", "-LZpOU41nWD9dgSPNJRy", "-LZpU2HXV85mLsYiCkiz", "-LZpUTaRJ4b0vPwpPijn", "-LZpXiko6naDIsWFg0Bj", "-LZpWBzq6SBlaPJVQga9", "-LZpXtT58K8q8ZWDCiJx", "-LZp_enMA9kBa_wTMea0", "-LZpiY0y-inmv8fdsSML", "-LZpsLLZ_duQ2AuJ9_8W", "-LZpts3VuxMcAEAVDZkj", "-LZq71L2FVOKR8cc1KYw", "-LZqI3RNmUTpNPffknIN", "-LZqL4R5hEVwVu592d9M", "-LZqLHLcPLLH8cjFKrjJ", "-LZqO992JLrDOEf1F9gY", "-LZqd0FlbXx2vBkL-38C", "-LZqy3isJY7ZgbcZwFxH", "-LZr14J0VX5PKb4Iz6Bo", "-LZr8hh7V298kjSzPLFz", "-LZtjI09wAYr-_Ysktam", "-LZtw_V7pZSEomMlaVwR", "-LZtxI95joVdIngN2rmK", "-LZu3phjhQRL7cBrLwDT", "-LZu4oCXiKPnnXrsg_WT", "-LZu7WyocGe51ILewT_L", "-LZu7Aip6waqY_B5nzo3", "-LZu96Uop-xmNut-s1jl", "-LZuC4iBUDbMx0yYMVJ9", "-LZuFRSNvXVU_fLbfP4R", "-LZuEwrg13rskjKGhicx", "-LZuJKBFaxA-E6xd0_Aq", "-LZuIgGkujA586ilcPVo", "-LZuMe8lyockSUbr1K9Z", "-LZuO_njH4c2aO36iP5T", "-LZuQb-kKUS0U0fs-Tgw", "-LZuUnn0FkdhohzNQs2c", "-LZuZ45ixB21o-wBgbhQ", "-LZud4CDqAkn8ldIWvaU", "-LZup5CdB13JkijufJGb", "-LZurtxALM7t_fnTga1W", "-LZv-LIByQhYAnkae5-P", "-LZv4mTc9wkqwOZY8wjD", "-LZv6bpl15NbUpW4pzGC", "-LZvCq8tSH9LjxW_wNc4", "-LZvBX838--s85dbDcx9", "-LZvCPN_bE395ToaNWGj", "-LZvHfnsR0VioNKhx-uW", "-LZvLWjuJ3pRcEwRl63Y", "-LZvMb6aQNU3VTg2IrrD", "-LZvOBb-5jN0W58FFYXJ", "-LZvSixcRfBwixrNLizx", "-LZvXTWC1NW60WuRU3ts", "-LZvZYWjht6GF3qMQSad", "-LZvbDNgG41HBzu526FK", "-LZvdxvf4ardpE20UGK-", "-LZvi2czjcOtTGYP5oW9", "-LZvlL_xearWsxN7XwlW", "-LZvrfYP1W63ZvQq5_O4", "-LZyzD911wVvYgxMsGsV", "-LZzA-XsUWZ8ffIbsx1j", "-LZzBLkCwqceAfeeHFHj", "-LZzAe51UG2Ryns8ar-8", "-LZzDUcL1JoD8f_ffove", "-LZzFv0G2XN8eCb3P1Oc", "-LZzHwgS_ppDOp5ryIs5", "-LZzJsgoDujTG0OR_miq", "-LZzXU7dXmVGb_bP79y0", "-LZzaW8rzB4jhc8e8vZt", "-LZzfIeIVT7rPSujWzLC", "-LZziNzndzZzLsxjPWss", "-LZzmf7CyQFWlH0oBjhA", "-LZzrTk68d5UarEwk8aX", "-L_-5MSZykQRs6LwOdJd", "-L_8Ld7wCDZNWdB0zc4P", "-L_8WkY0-a2b4iufLYjH", "-L_8WERWxM85XlG1cjgB", "-L_8ZfyIxUIF5DlyhdRQ", "-L_8cwSEIrR0ni6vzqAn", "-L_8hWEyXsN5XcUgHYUx", "-L_8e97lTu-KZmH8DsO_", "-L_8dNu6awLesI2LjVhW", "-L_8f9dRbUsAClTVMAw-", "-L_8hv-xPwwGFo3iUxGV", "-L_8iAmAERSF6MHfNoeX", "-L_8j1wWMX8HnNIErOM_", "-L_8jlBS1kGoRy764J2N", "-L_8l7WTP14pVljGTkPH", "-L_8lalh9ySzXJlWd16n", "-L_8ncbTu2wAkaFonNHH", "-L_8pVyho9hecpYYLciM", "-L_8rDQAZH59-NK53lZi", "-L_8quKcDup77RSYJtYg", "-L_8qpl5Q-4nn-bSUDNQ", "-L_8uYQ-cXNVLx9qWE0s", "-L_8uHdn-gBmEkoPnpTd", "-L_8vAsNwMbx-1i44zto", "-L_8uH5p3_ntv1OFjlGa", "-L_8u_2G9GEDWJ_C6BGg", "-L_8xkJSMTbbnoQuilL-", "-L_9-kLSZGc-UxQX9rgK", "-L_930BaRIcDgs2Az9EK", "-L_94wS-ZXCY1Z9Ympth", "-L_97VD2tK8avG_n1W-Z", "-L_9CRWtO2ND6iRIDW6y", "-L_9GE0ni4qe4fhWHmIU", "-L_9JcLdTpq4-_tE2yE9", "-L_9KoQvgsCeAaIoEk1B", "-L_9NRWrQ4N2uK4Ar6cK", "-L_9QCBXHSGpPwZPDuEZ", "-L_9U35tZHspWqnGyfkE", "-L_9YrZwfbQsl28RWeSm", "-L_9twArH-F8wW6q3zww", "-L_A-bBrpyQiWISwuBP2", "-LZuAMuRzkiKt3RQoINK", "-LZzFJA0HbtS2ZnxZ-_4", "-LZuXdmGSPcRFUwAvdsE", "-L_8Zc7IDLxuTnIeOB_V", "-L_DXR9JfUL63ycewJS7", "-L_DYX9qcLGDv6FDYB1Q", "-L_DlBtez0LqHGUoZ994", "-L_Do3Kk8_snvlmTqzlC", "-L_DvJCGd3NEyNYMaWF7", "-L_Dwowp4Ljamol30F0i", "-L_DyymGg9krB7j8z41d", "-L_E2uGITvTG4gY0MJLe", "-L_E6WV6IbfGbOnnmvzD", "-L_E4LNj9ZcXURvJNjix", "-L_E3am3Yh4sgLiNj7Oo", "-L_EA1JYBKuUi37T7jmY", "-L_EGE8xD4P3qte0rKRm", "-L_EJcDDg5S2Bg484WZ0", "-L_EOC6YFoUO-oXEJH6X", "-L_EfGZYv87FTt93Nngc", "-L_Eyh_czzMP0EJSeVtB", "-L_Eth0d0kTwM48O2Hqg", "-L_IQN0Uv5vN0nQp9SmM", "-L_IV-iS46IQXKIIYNJb", "-L_Ij_u3lAqwmJNJSpid", "-L_Io98uy7KyTDeZtN-m", "-L_IuTx5waoRyXcyWqlo", "-L_IzXRfWEhqJbSDohmC", "-L_J3GktOJ1bQEhxCPyE", "-L_J0w-EGU80IaLq7CW4", "-L_IyVW63Ce5S9ceXTBb", "-L_J6a2jcBd_eT8VWwOM", "-L_J6nMKPIFm16lvL0DB", "-L_J9Qi3_Cgj9CWA4j5L", "-L_JGXIM7Pk7nHTPdLBO", "-L_JHmBuwo6zBLC9gTSp", "-L_JLhzwFG4Pc-i40xJp", "-L_JID584sBXQPyaSETy", "-L_JQ7NFCglEtMjFzHKc", "-L_JRWmriIyBwlvfPI8A", "-L_JRqSbM8LP5pOWcnoF", "-L_JVVIcVCdIzIcNS8uZ", "-L_JbSg4Si2aEH6MZISW", "-L_Jcmn3aDvs0z-U3UP6", "-L_Ja9hckc395-f0wBLy", "-L_JfUgTJGo_t7Ex9oNy", "-L_Jemm9cmmaKrYiEwZq", "-L_JfuzMW4_qcJTbvWSM", "-L_Jk6e6iegoZWPO8qvR", "-L_JURTJLN-ZGBR0NiqW", "-L_JvuFhNHRhwfr5Eb6a", "-L_K3o-RO0XwyyaCnOSL", "-L_NbNkGw0jyhpXMptCd", "-LTi-vYGfZLB3wboNhkd", "-L_NwDZXoWaYU8p62nYu", "-L_Nw-ZFuVm887hvS_Hz", "-L_NzUOzlf4MMYXAhjmO", "-L_OAX3pK7kNjcRsfM2X", "-L_OEySEwhhHxYBcxRs_", "-L_OLV1wgCEBIYHuFfGS", "-L_ONRbJwl7o9cF7nbcf", "-L_ORo7Cio9jxV9_TJaQ", "-L_ORZObmoL2l9tHs0gd", "-L_OTcstalwuI6IcS6Qs", "-L_OggW_1noBynOObcBR", "-L_Ok1EP6iUdbCCWwnlv", "-L_Oj4gkHwsBoxZlm9YC", "-L_PBqHNiNQvGJ0jclMa", "-L_PG0FgLxEV9Eddlyzn", "-L_PFa_P-95ykexvG7vJ", "-L_PQ1eA3luf8lkKsLlz", "-L_PNNwYdbNmnvLqfajV", "-L_JOfTg4gR3ZlyftQTK", "-L_T5iStq79Xf9JmrKTL", "-L_T8uUEi-_WG8fqoiiP", "-L_T9ZwbR08f6_K3eGnl", "-L_T8NcXIjdIH9s16av_", "-L_TBCxAKpigCXL1da_g", "-L_TEObAHGFvXNOeyw7r", "-L_TH5KdzuT6YiiS3CyL", "-L_TJAvYLWH-1JAiTiSr", "-L_TFxXlBbW_nkTAr90X", "-L_TIParFDMHhGI8_WAV", "-L_TN2DvjEHvRsoSv-qe", "-L_TNe09T7sPAclgxrsG", "-L_TQXXXKTuZzgbeg04I", "-L_TSbEU07rBerXt1wcE", "-L_TR4gJFnLuET7EWScL", "-L_TYhPqiUYNh4R_cXDL", "-L_T_95vRZjvASlzQAxV", "-L_TZzr-l3DlRJfxDg6m", "-L_TZkYQfU3hsUWINthA", "-L_ThJOuFfSkltn5R_Tg", "-L_Tjn_MhmKom4nfcrJK", "-L_To3hAFz95st7c6mLd", "-L_TqjIpW6xJLYK5dgeA", "-L_TvNlROf46jjXmfIuh", "-L_UC02fkgKCEx8j9W9X", "-L_UGQ-6ZGuo3331OCXD", "-L_UIR4xp8X6w5KVBh-n", "-L_UKphXHF7aJNAR59qX", "-L_UX525_cPv4b99jxxN", "-L_UbSn93rsiS7OWClSi", "-L_YG5TDN-A90XJnYRji", "-L_YICWhHPTkPohG_95L", "-L_YJOWdL0RpwlWNj8-k", "-L_YR3xNnQA4eJ5nJhNO", "-L_Z7UndFECse8f9Y2Ty"];

for (var i = 0; i < array.length; i++) {
  console.log(array[i]);
  var docRef = positivefs.collection("transfer").doc(array[i]);

  docRef.get().then(function(doc) {
    if (doc.exists) {
      // console.log("Document data:", doc.data());
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
      console.log(array[i]);
    }
  }).catch(function(error) {
    console.log("Error getting document:", error);
  });
}

//
// var iterator = array.values();
//
// one(iterator.next().value);
//
//
//

// function one(key) {
//   transferdb.orderByKey().equalTo(key).once('value').then(function(snapshot) {
//     snapshot.forEach(function(child) {
//       if (child == null) {
//         return true;
//       } else {
//         getObj(child, child.val().signal);
//         console.log("key _ " + child.key);
//         one(iterator.next().value);
//       }
//     });
//   });
// }
//
// var collect = [];

function getObj(snapshot, status) {

  info['transfer'] = snapshot.val();

  accountdb.orderByKey().equalTo(info['transfer']['key_empresa']).once('value').then(function(snap) {

    getAccount(snap);

  }).then(function() {

    accountdb.orderByKey().equalTo(info['account']['entidad']).once('value').then(function(snap) {

      getEntity(snap);

    }).then(function() {

      persondb.orderByKey().equalTo(info['transfer']['key_persona']).once('value').then(function(snap) {

        getPerson(snap);

      }).then(function() {

        positiondb.orderByKey().equalTo(info['transfer']['key_encuesta']).once('value').then(function(snap) {

          getPosition(snap);

          info = {
            transfer: {},
            account: {},
            entity: {},
            person: {}
          };

        });

      });

    });

  });

}

function getAccount(snap) {
  snap.forEach(function(child) {
    if (child == null) {
      return true;
    } else {
      info['account'] = child.val();
      info['account']['key'] = child.key;
    }
  });
}

function getEntity(snap) {
  snap.forEach(function(child) {
    if (child == null) {
      return true;
    } else {
      info['entity'] = child.val();
      info['entity']['key'] = child.key;
    }
  });
}

function getPerson(snap) {
  snap.forEach(function(child) {
    if (child == null) {
      return true;
    } else {
      info['person'] = child.val();
      info['person']['key'] = child.key;
    }
  });
}

function getPosition(snap) {
  snap.forEach(function(child) {
    if (child == null) {
      return true;
    } else {
      let questionary = child.val().cuestionario;
      let resultSet = (info['transfer'].resultado).split("|"),
        j = 0,
        area = [];

      for (var i = 0; i < questionary.length; i++) {
        if (questionary[i]['tipo'] == "pregunta" &&
          questionary[i]['area'] != "Tutorial Automático") {
          questionary[i]['resultSet'] = resultSet[j];
          area.push(questionary[i]['area']);
          j++
        }
      }

      unique(area);
      questionary.sort(sortBy('topic'));

      let collectTopic = getCollectTopic(questionary);
      let collectArea = getCollectArea(area, collectTopic);

      console.log(collectArea);
    }
  });
}

/**
 * Get info from topics to calculate score GCP
 * @param   questionary FB object
 * @return              array
 */

function getCollectTopic(questionary) {
  let collectTopic = [],
    lastTopic = "",
    infoTopic = {
      name: null,
      area: null,
      questions: [],
      average: 0
    };

  let infoQuestion = {},
    k = 0,
    l = 0;;

  for (var i = 0; i < questionary.length; i++) {

    if (questionary[i]['tipo'] == "pregunta" &&
      questionary[i]['area'] != "Tutorial Automático") {

      l++;

      if (questionary[i]['topic'] == lastTopic || k == 0) {
        infoTopic['name'] = questionary[i]['topic'];
        infoTopic['area'] = questionary[i]['area'];

        infoQuestion['res'] = getResult(questionary[i]['resultSet']);
        infoTopic['average'] += getAverage(infoQuestion['res'], questionary[i]['puntaje']);
        infoTopic['questions'].push(infoQuestion);
        lastTopic = questionary[i]['topic'];
        k++;
      }

      if (questionary[i]['topic'] != lastTopic && k != 0) {
        collectTopic.push(infoTopic);
        infoTopic['average'] = Math.round(80 - (infoTopic['average'] / (l - 1)));
        infoTopic = {
          name: null,
          area: null,
          questions: [],
          average: 0
        };

        lastTopic = questionary[i]['topic'];
        infoQuestion['res'] = getResult(questionary[i]['resultSet']);
        infoTopic['average'] += getAverage(infoQuestion['res'], questionary[i]['puntaje']);
        infoTopic['questions'].push(infoQuestion);
        l = 1;
      }

    }

    infoQuestion = {};

  }

  infoTopic['average'] = Math.round(80 - (infoTopic['average'] / (l)));
  collectTopic.push(infoTopic);

  return collectTopic;
}

/**
 * Get info from areas to calculate score GCP
 * @param   questionary FB object
 * @return              array
 */

function getCollectArea(area, collectTopic) {
  let collectArea = [],
    infoArea = {
      name: null,
      average: 0
    };

  for (i = 0; i < area.length; i++) {
    infoArea['name'] = area[i];

    collectArea.push(infoArea);
    infoArea = {
      name: null,
      average: 0
    };
  }

  let count = 0;

  for (j = 0; j < collectArea.length; j++) {
    for (i = 0; i < collectTopic.length; i++) {
      if (collectArea[j]['name'] == collectTopic[i]['area']) {
        collectArea[j]['average'] += collectTopic[i]['average'];
        count++;
      }
    }
    collectArea[j]['average'] = Math.round(collectArea[j]['average'] / count);
    count = 0;
  }

  return collectArea;
}

/**
 * Get result to user interface
 * @param   res ra7 result
 * @return      report result
 */

function getResult(res) {
  resultSet = 100 - res;

  if (resultSet > 95) {
    resultSet = 95;
  } else if (resultSet < 5) {
    resultSet = 5;
  }

  return resultSet;
  s
}

/**
 * Get the "average" from every resul
 * @param   resultSet result from getResult
 * @param   score     FB puntaje
 * @return            "average"
 */

function getAverage(resultSet, score) {
  let res = 0;

  if (score == 40) {
    res = (80 - resultSet) * 3;
  } else if (score == 30) {
    res = (80 - resultSet);
  } else if (score == 20) {
    res = (80 - resultSet) * 0.5;
  }

  return res;
}