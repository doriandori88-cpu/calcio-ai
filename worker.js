const INDEX_HTML_B64 = "PCFkb2N0eXBlIGh0bWw+CjxodG1sIGxhbmc9Iml0Ij4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9InV0Zi04Ij48bWV0YSBuYW1lPSJ2aWV3cG9ydCIgY29udGVudD0id2lkdGg9ZGV2aWNlLXdpZHRoLGluaXRpYWwtc2NhbGU9MSI+Cjx0aXRsZT5DYWxjaW8gQUkgMS4wPC90aXRsZT4KPHN0eWxlPgpib2R5e21hcmdpbjowO2JhY2tncm91bmQ6IzA3MTExZjtjb2xvcjojZjRmN2ZiO2ZvbnQtZmFtaWx5Oi1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCJTZWdvZSBVSSIsc2Fucy1zZXJpZn0KbWFpbnttYXgtd2lkdGg6ODAwcHg7bWFyZ2luOmF1dG87cGFkZGluZzozOHB4IDE4cHh9aDF7Zm9udC1zaXplOjQycHg7bWFyZ2luOjAgMCA4cHh9LnN1YiwubWV0YSwuc21hbGx7Y29sb3I6IzkzYTRiZn0KLmNvbnRyb2xze2Rpc3BsYXk6ZmxleDtnYXA6MTBweDtmbGV4LXdyYXA6d3JhcDttYXJnaW46MjBweCAwfXNlbGVjdCxidXR0b257Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czoxNHB4O3BhZGRpbmc6MTNweCAxNHB4O2ZvbnQtc2l6ZToxNnB4fQpzZWxlY3R7YmFja2dyb3VuZDojMTQyMjM5O2NvbG9yOiNmZmY7bWluLXdpZHRoOjIyMHB4fWJ1dHRvbntiYWNrZ3JvdW5kOiM3MmNkZjQ7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOiMwODc1ZDF9CiNzdGF0dXMsLm1hdGNoe21hcmdpbjoxOHB4IDA7cGFkZGluZzoxOHB4O2JvcmRlcjoxcHggc29saWQgIzJhM2M1Yztib3JkZXItcmFkaXVzOjE4cHg7YmFja2dyb3VuZDojMTExZDMxfQoudGVhbXN7ZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O2ZvbnQtd2VpZ2h0Ojc1MDtmb250LXNpemU6MjBweDttYXJnaW46MTJweCAwfQoudGVhbXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHh9LnRlYW0gaW1ne3dpZHRoOjM2cHg7aGVpZ2h0OjM2cHg7b2JqZWN0LWZpdDpjb250YWlufQouZ3JpZHtkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOnJlcGVhdCgzLDFmcik7Z2FwOjhweH0ucHtiYWNrZ3JvdW5kOiMxNzI3NDI7Ym9yZGVyLXJhZGl1czoxMnB4O3BhZGRpbmc6MTBweDt0ZXh0LWFsaWduOmNlbnRlcn0uYmVzdHtvdXRsaW5lOjJweCBzb2xpZCAjNzJjZGY0fQoucm93e21hcmdpbi10b3A6MTJweDtsaW5lLWhlaWdodDoxLjU1fS50YWd7ZGlzcGxheTppbmxpbmUtYmxvY2s7YmFja2dyb3VuZDojMTcyNzQyO3BhZGRpbmc6NnB4IDlweDtib3JkZXItcmFkaXVzOjlweDttYXJnaW46M3B4IDRweCAzcHggMH0KLnNtYWxse2ZvbnQtc2l6ZToxM3B4O21hcmdpbi10b3A6MTBweH0ubm90aWNle2ZvbnQtc2l6ZToxM3B4O2NvbG9yOiNjNWQ0ZTg7bWFyZ2luLXRvcDoxMHB4O3BhZGRpbmc6OXB4IDEwcHg7YmFja2dyb3VuZDojMTcyNzQyO2JvcmRlci1yYWRpdXM6MTBweH0KLmRldGFpbGJ0bnttYXJnaW4tdG9wOjE0cHg7YmFja2dyb3VuZDojMjAzNjUzO2NvbG9yOiNkOWVjZmY7d2lkdGg6MTAwJX0KLmRldGFpbHN7bWFyZ2luLXRvcDoxMnB4O3BhZGRpbmc6MTJweDtiYWNrZ3JvdW5kOiMwZDE5MmI7Ym9yZGVyLXJhZGl1czoxMnB4fQouc2VjdGlvbnttYXJnaW4tdG9wOjEycHh9LnNlY3Rpb24gYntkaXNwbGF5OmJsb2NrO21hcmdpbi1ib3R0b206NnB4fS5tdXRlZHtjb2xvcjojOTNhNGJmO2ZvbnQtc2l6ZToxM3B4fQoucGxheWVybGluZXtwYWRkaW5nOjRweCAwO2JvcmRlci1ib3R0b206MXB4IHNvbGlkICMyMDMwNGF9Lm9kZHNncmlke2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6cmVwZWF0KDMsMWZyKTtnYXA6N3B4fS5vZGR7YmFja2dyb3VuZDojMTcyNzQyO2JvcmRlci1yYWRpdXM6MTBweDtwYWRkaW5nOjhweDt0ZXh0LWFsaWduOmNlbnRlcn0KLnZhbHVlYm94e21hcmdpbi10b3A6MTBweDtiYWNrZ3JvdW5kOiMxNzI3NDI7Ym9yZGVyLXJhZGl1czoxMnB4O3BhZGRpbmc6MTBweH0KLnZhbHVlcm93e2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6NDJweCAxZnIgMWZyIDFmcjtnYXA6NnB4O3BhZGRpbmc6NnB4IDA7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgIzI1Mzc1Mjtmb250LXNpemU6MTNweH0KLnZhbHVlcm93Omxhc3QtY2hpbGR7Ym9yZGVyLWJvdHRvbTowfS5wb3NpdGl2ZXtmb250LXdlaWdodDo3MDB9Lndhcm5pbmd7Zm9udC1zaXplOjEycHg7Y29sb3I6IzkzYTRiZjttYXJnaW4tdG9wOjhweH0KPC9zdHlsZT48L2hlYWQ+Cjxib2R5PjxtYWluPgo8ZGl2IGlkPSJhcGktcmVtYWluaW5nIiBjbGFzcz0ibXV0ZWQiIHN0eWxlPSJtYXJnaW46MCAwIDEycHggMnB4Ij48L2Rpdj4KPGgxPkNhbGNpbyBBSSAxLjA8L2gxPgo8cCBjbGFzcz0ic3ViIj5BbmFsaXNpIHByZS1tYXRjaCBjb21wbGV0YSDigKIgUG93ZXIgUmF0aW5nIOKAoiBWQUxVRSDigKIgbWVyY2F0aSDigKIgYXNzZW50aSDigKIgZm9ybWF6aW9uaSB1ZmZpY2lhbGk8L3A+Cgo8ZGl2IGNsYXNzPSJjb250cm9scyI+CjxzZWxlY3QgaWQ9ImxlYWd1ZSI+CjxvcHRpb24gdmFsdWU9IjEzNSI+8J+HrvCfh7kgU2VyaWUgQTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9IjEzNiI+8J+HrvCfh7kgU2VyaWUgQjwvb3B0aW9uPgo8b3B0aW9uIHZhbHVlPSIzOSI+8J+HrPCfh6cgUHJlbWllciBMZWFndWU8L29wdGlvbj48b3B0aW9uIHZhbHVlPSIxNDAiPvCfh6rwn4e4IExhIExpZ2E8L29wdGlvbj4KPG9wdGlvbiB2YWx1ZT0iNzgiPvCfh6nwn4eqIEJ1bmRlc2xpZ2E8L29wdGlvbj48b3B0aW9uIHZhbHVlPSI2MSI+8J+Hq/Cfh7cgTGlndWUgMTwvb3B0aW9uPgo8b3B0aW9uIHZhbHVlPSI4OCI+8J+Hs/Cfh7EgRXJlZGl2aXNpZTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9Ijk0Ij7wn4e18J+HuSBQcmltZWlyYSBMaWdhPC9vcHRpb24+CjxvcHRpb24gdmFsdWU9IjIiPvCfh6rwn4e6IENoYW1waW9ucyBMZWFndWU8L29wdGlvbj48b3B0aW9uIHZhbHVlPSIzIj7wn4eq8J+HuiBFdXJvcGEgTGVhZ3VlPC9vcHRpb24+Cjwvc2VsZWN0Pgo8YnV0dG9uIG9uY2xpY2s9ImxvYWQoZmFsc2UpIj5BZ2dpb3JuYTwvYnV0dG9uPgo8L2Rpdj4KPGRpdiBjbGFzcz0ic21hbGwiPkNhY2hlIGxvY2FsZSAzMCBtaW51dGkgKyBjYWNoZSBOZXRsaWZ5IGR1cmV2b2xlLiBRdW90ZSwgYXNzZW50aSBlIGZvcm1hemlvbmkgdmVuZ29ubyBjYXJpY2F0aSBzb2xvIHF1YW5kbyBhcHJpIGxhIHBhcnRpdGEuPC9kaXY+CjxkaXYgY2xhc3M9Im5vdGljZSI+PGI+Q2FsY2lvIEFJIDEuMDwvYj48YnI+SWwgbW9kZWxsbyBub24gcHViYmxpY2EgcGVyY2VudHVhbGkgcXVhbmRvIG1hbmNhIHVuYSBiYXNlIHN0YXRpc3RpY2EgcmVhbGUgc3VmZmljaWVudGUuIElsIFZBTFVFIGNvbmZyb250YSBpbCBtb2RlbGxvIGNvbiBsZSBxdW90ZSBkZXB1cmF0ZSBkYWwgbWFyZ2luZSBkZWwgYm9va21ha2VyLjwvZGl2PgoKPGRpdiBpZD0ic3RhdHVzIj5DYXJpY2FtZW50b+KApjwvZGl2PjxkaXYgaWQ9Im1hdGNoZXMiPjwvZGl2PgoKPHNjcmlwdD4KY29uc3QgbW9kZWxCeUZpeHR1cmU9e307CmNvbnN0IGU9cz0+U3RyaW5nKHM/PycnKS5yZXBsYWNlKC9bJjw+IiddL2csbT0+KHsnJic6JyZhbXA7JywnPCc6JyZsdDsnLCc+JzonJmd0OycsJyInOicmcXVvdDsnLCInIjonJiMzOTsnfVttXSkpOwpjb25zdCBwY3Q9eD0+KHgqMTAwKS50b0ZpeGVkKDEpKyclJzsKCmNvbnN0IENBQ0hFX1RUTCA9IDMwKjYwKjEwMDA7CgpmdW5jdGlvbiBjYWNoZUtleShsZWFndWUpeyByZXR1cm4gJ2NhbGNpb2FpX3YxMF8nK2xlYWd1ZTsgfQoKZnVuY3Rpb24gZ2V0TG9jYWxDYWNoZShsZWFndWUpewogdHJ5ewogICBjb25zdCByYXc9bG9jYWxTdG9yYWdlLmdldEl0ZW0oY2FjaGVLZXkobGVhZ3VlKSk7CiAgIGlmKCFyYXcpcmV0dXJuIG51bGw7CiAgIGNvbnN0IG9iaj1KU09OLnBhcnNlKHJhdyk7CiAgIGlmKCFvYmouc2F2ZWRBdCB8fCAoRGF0ZS5ub3coKS1vYmouc2F2ZWRBdCk+Q0FDSEVfVFRMKXJldHVybiBudWxsOwogICByZXR1cm4gb2JqLmRhdGE7CiB9Y2F0Y2h7cmV0dXJuIG51bGx9Cn0KCmZ1bmN0aW9uIHNldExvY2FsQ2FjaGUobGVhZ3VlLGRhdGEpewogdHJ5eyBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShjYWNoZUtleShsZWFndWUpLEpTT04uc3RyaW5naWZ5KHtzYXZlZEF0OkRhdGUubm93KCksZGF0YX0pKTsgfWNhdGNoe30KfQoKYXN5bmMgZnVuY3Rpb24gbG9hZChmb3JjZT1mYWxzZSl7CiBjb25zdCBsZWFndWU9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlYWd1ZScpLnZhbHVlLCBzdD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc3RhdHVzJyksIGJveD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWF0Y2hlcycpOwogYm94LmlubmVySFRNTD0nJzsKCiBjb25zdCBjYWNoZWQ9Z2V0TG9jYWxDYWNoZShsZWFndWUpOwogaWYoY2FjaGVkICYmICFmb3JjZSl7CiAgIHJlbmRlcihjYWNoZWQsdHJ1ZSk7CiAgIHJldHVybjsKIH0KCiBzdC50ZXh0Q29udGVudD0nQW5hbGlzaSBpbiBjb3Jzb+KApic7CiB0cnl7CiAgY29uc3Qgcj1hd2FpdCBmZXRjaCgnL2FwaS9hbmFseXplP2xlYWd1ZT0nK2VuY29kZVVSSUNvbXBvbmVudChsZWFndWUpKycmdj0xMDAnKTsKICBjb25zdCBqPWF3YWl0IHIuanNvbigpOwogY29uc3QgcmVtPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhcGktcmVtYWluaW5nJyk7CiBpZihyZW0gJiYgai5tZXRhICYmIGoubWV0YS5yZXF1ZXN0c1JlbWFpbmluZyE9bnVsbCl7CiAgIHJlbS50ZXh0Q29udGVudD1gQVBJLUZvb3RiYWxsOiAke2oubWV0YS5yZXF1ZXN0c1JlbWFpbmluZ30gcmljaGllc3RlIHJpbWFzdGUgb2dnaWA7CiB9CiAgaWYoci5vayAmJiBqLm9rKXNldExvY2FsQ2FjaGUobGVhZ3VlLGopOwogIGlmKCFyLm9rfHwhai5vayl7c3QuaW5uZXJIVE1MPSc8Yj5FcnJvcmU8L2I+PGJyPicrZShqLm1lc3NhZ2V8fCcnKTtyZXR1cm59CiAgcmVuZGVyKGosZmFsc2UpOwogfWNhdGNoKHgpe3N0LnRleHRDb250ZW50PSdFcnJvcmU6ICcreC5tZXNzYWdlfQp9CgpmdW5jdGlvbiByZW5kZXIoaixmcm9tQ2FjaGUpewogY29uc3Qgc3Q9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3N0YXR1cycpLCBib3g9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21hdGNoZXMnKTsKIGJveC5pbm5lckhUTUw9Jyc7CiBzdC50ZXh0Q29udGVudD1gJHtqLm1hdGNoZXMubGVuZ3RofSBwYXJ0aXRlIOKAoiAke2oubWV0YS5sZWFndWVOYW1lfSDigKIgJHtmcm9tQ2FjaGU/J2NhY2hlIGxvY2FsZSc6J2RhdGkgYWdnaW9ybmF0aSd9IOKAoiAke2oubWV0YS5hcGlDYWxsc30gY2hpYW1hdGUgQVBJIOKAoiBtb2RlbGxvICR7ai5tZXRhLnZlcnNpb258fCcxLjAnfWA7CiBpZighai5tYXRjaGVzLmxlbmd0aCl7Ym94LmlubmVySFRNTD0nPGRpdiBjbGFzcz0ibWF0Y2giPk5lc3N1bmEgcGFydGl0YSBuZWkgcHJvc3NpbWkgMTQgZ2lvcm5pLjwvZGl2Pic7cmV0dXJufQogai5tYXRjaGVzLmZvckVhY2goZz0+ewogICBjb25zdCBhPWcuYW5hbHlzaXM7CiAgIG1vZGVsQnlGaXh0dXJlW2cuaWRdPWE7CiAgIGNvbnN0IGR0PW5ldyBEYXRlKGcuZGF0ZSkudG9Mb2NhbGVTdHJpbmcoJ2l0LUlUJyx7d2Vla2RheTonc2hvcnQnLGRheTonMi1kaWdpdCcsbW9udGg6JzItZGlnaXQnLGhvdXI6JzItZGlnaXQnLG1pbnV0ZTonMi1kaWdpdCd9KTsKICAgaWYoYS5pbnN1ZmZpY2llbnQpewogICAgIGJveC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsYDxkaXYgY2xhc3M9Im1hdGNoIj4KICAgICAgPGRpdiBjbGFzcz0ibWV0YSI+JHtlKGR0KX08L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0idGVhbXMiPjxzcGFuIGNsYXNzPSJ0ZWFtIj48aW1nIHNyYz0iJHtlKGcuaG9tZS5sb2dvKX0iPiR7ZShnLmhvbWUubmFtZSl9PC9zcGFuPjxzcGFuPuKAkzwvc3Bhbj48c3BhbiBjbGFzcz0idGVhbSI+JHtlKGcuYXdheS5uYW1lKX08aW1nIHNyYz0iJHtlKGcuYXdheS5sb2dvKX0iPjwvc3Bhbj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0ibm90aWNlIj48Yj5EYXRpIGluc3VmZmljaWVudGk8L2I+PGJyPiR7ZShhLnJlYXNvbil9PC9kaXY+CiAgICAgICR7YS5leHBsYWluP2A8ZGl2IGNsYXNzPSJub3RpY2UiPjxiPkNvbnRyb2xsbyBkYXRpPC9iPjxicj4ke2EuZXhwbGFpbi5tYXAodj0+YOKAoiAke2Uodil9YCkuam9pbignPGJyPicpfTwvZGl2PmA6Jyd9CiAgICAgIDxidXR0b24gY2xhc3M9ImRldGFpbGJ0biIgb25jbGljaz0ibG9hZERldGFpbHMoJHtnLmlkfSx0aGlzKSI+UXVvdGUg4oCiIEFzc2VudGkg4oCiIEZvcm1hemlvbmk8L2J1dHRvbj4KICAgICAgPGRpdiBjbGFzcz0iZGV0YWlscyIgaWQ9ImRldGFpbHMtJHtnLmlkfSIgc3R5bGU9ImRpc3BsYXk6bm9uZSI+PC9kaXY+CiAgICAgPC9kaXY+YCk7CiAgICAgcmV0dXJuOwogICB9CiAgIGNvbnN0IHZhbHM9W2EucDEsYS5weCxhLnAyXSwgbXg9TWF0aC5tYXgoLi4udmFscyk7CiAgIGJveC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsYDxkaXYgY2xhc3M9Im1hdGNoIj4KICAgIDxkaXYgY2xhc3M9Im1ldGEiPiR7ZShkdCl9PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJ0ZWFtcyI+PHNwYW4gY2xhc3M9InRlYW0iPjxpbWcgc3JjPSIke2UoZy5ob21lLmxvZ28pfSI+JHtlKGcuaG9tZS5uYW1lKX08L3NwYW4+PHNwYW4+4oCTPC9zcGFuPjxzcGFuIGNsYXNzPSJ0ZWFtIj4ke2UoZy5hd2F5Lm5hbWUpfTxpbWcgc3JjPSIke2UoZy5hd2F5LmxvZ28pfSI+PC9zcGFuPjwvZGl2PgogICAgPGRpdiBjbGFzcz0iZ3JpZCI+PGRpdiBjbGFzcz0icCAke2EucDE9PW14PydiZXN0JzonJ30iPjxiPjE8L2I+PGJyPiR7cGN0KGEucDEpfTwvZGl2PjxkaXYgY2xhc3M9InAgJHthLnB4PT1teD8nYmVzdCc6Jyd9Ij48Yj5YPC9iPjxicj4ke3BjdChhLnB4KX08L2Rpdj48ZGl2IGNsYXNzPSJwICR7YS5wMj09bXg/J2Jlc3QnOicnfSI+PGI+MjwvYj48YnI+JHtwY3QoYS5wMil9PC9kaXY+PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJyb3ciPjxiPkdvbCBhdHRlc2k6PC9iPiAke2EubGgudG9GaXhlZCgyKX0g4oCTICR7YS5sYS50b0ZpeGVkKDIpfTwvZGl2PgogICAgPGRpdiBjbGFzcz0icm93Ij48c3BhbiBjbGFzcz0idGFnIj5Gb3J6YSBjYXNhICR7YS5ob21lUG93ZXIudG9GaXhlZCgyKX08L3NwYW4+PHNwYW4gY2xhc3M9InRhZyI+Rm9yemEgb3NwaXRlICR7YS5hd2F5UG93ZXIudG9GaXhlZCgyKX08L3NwYW4+PHNwYW4gY2xhc3M9InRhZyI+QWZmaWRhYmlsaXTDoCAke2UoYS5jb25maWRlbmNlKX08L3NwYW4+PC9kaXY+CiAgICAke2EuY29uZmlkZW5jZT09PSJtb2x0byBiYXNzYSJ8fGEuY29uZmlkZW5jZT09PSJiYXNzYSI/JzxkaXYgY2xhc3M9Im5vdGljZSI+UHJvbm9zdGljbyBwcnVkZW56aWFsZTogY2FtcGlvbmUgY29ycmVudGUgYW5jb3JhIHJpZG90dG8uPC9kaXY+JzonJ30KICAgIDxkaXYgY2xhc3M9InJvdyI+PGI+UmlzdWx0YXRpIGVzYXR0aTo8L2I+ICR7YS5zY29yZXMubWFwKHg9PmA8c3BhbiBjbGFzcz0idGFnIj4ke3guc2NvcmV9ICR7cGN0KHgucCl9PC9zcGFuPmApLmpvaW4oJycpfTwvZGl2PgogICAgPGRpdiBjbGFzcz0icm93Ij48Yj5Hb2w6PC9iPgogICAgICA8c3BhbiBjbGFzcz0idGFnIj5PdmVyIDEuNSAke3BjdChhLm92ZXIxNSl9PC9zcGFuPjxzcGFuIGNsYXNzPSJ0YWciPlVuZGVyIDEuNSAke3BjdChhLnVuZGVyMTUpfTwvc3Bhbj4KICAgICAgPHNwYW4gY2xhc3M9InRhZyI+T3ZlciAyLjUgJHtwY3QoYS5vdmVyKX08L3NwYW4+PHNwYW4gY2xhc3M9InRhZyI+VW5kZXIgMi41ICR7cGN0KGEudW5kZXIpfTwvc3Bhbj4KICAgICAgPHNwYW4gY2xhc3M9InRhZyI+T3ZlciAzLjUgJHtwY3QoYS5vdmVyMzUpfTwvc3Bhbj48c3BhbiBjbGFzcz0idGFnIj5VbmRlciAzLjUgJHtwY3QoYS51bmRlcjM1KX08L3NwYW4+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9InJvdyI+PGI+RW50cmFtYmUgc2VnbmFubzo8L2I+IDxzcGFuIGNsYXNzPSJ0YWciPkdvYWwgJHtwY3QoYS5idHRzKX08L3NwYW4+PHNwYW4gY2xhc3M9InRhZyI+Tm8gR29hbCAke3BjdChhLm5vQnR0cyl9PC9zcGFuPjwvZGl2PgogICAgPGRpdiBjbGFzcz0icm93Ij48Yj5Eb3BwaWEgY2hhbmNlOjwvYj4gPHNwYW4gY2xhc3M9InRhZyI+MVggJHtwY3QoYS5kYzF4KX08L3NwYW4+PHNwYW4gY2xhc3M9InRhZyI+MTIgJHtwY3QoYS5kYzEyKX08L3NwYW4+PHNwYW4gY2xhc3M9InRhZyI+WDIgJHtwY3QoYS5kY3gyKX08L3NwYW4+PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJyb3ciPjxiPkRyYXcgTm8gQmV0OjwvYj4gPHNwYW4gY2xhc3M9InRhZyI+Q2FzYSAke3BjdChhLmRuYjEpfTwvc3Bhbj48c3BhbiBjbGFzcz0idGFnIj5Pc3BpdGUgJHtwY3QoYS5kbmIyKX08L3NwYW4+PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJzbWFsbCI+JHtlKGEubWV0aG9kKX08L2Rpdj4KICAgICR7YS5ub3RlP2A8ZGl2IGNsYXNzPSJub3RpY2UiPiR7ZShhLm5vdGUpfTwvZGl2PmA6Jyd9CiAgICAke2EuZXhwbGFpbj9gPGRpdiBjbGFzcz0ibm90aWNlIj48Yj5QZXJjaMOpIGlsIG1vZGVsbG8gZGljZSBxdWVzdG88L2I+PGJyPgogICAgICAke2EuZXhwbGFpbi5tYXAodj0+YOKAoiAke2Uodil9YCkuam9pbignPGJyPicpfQogICAgPC9kaXY+YDonJ30KICAgIDxidXR0b24gY2xhc3M9ImRldGFpbGJ0biIgb25jbGljaz0ibG9hZERldGFpbHMoJHtnLmlkfSx0aGlzKSI+UXVvdGUg4oCiIEFzc2VudGkg4oCiIEZvcm1hemlvbmk8L2J1dHRvbj4KICAgIDxkaXYgY2xhc3M9ImRldGFpbHMiIGlkPSJkZXRhaWxzLSR7Zy5pZH0iIHN0eWxlPSJkaXNwbGF5Om5vbmUiPjwvZGl2PgogICA8L2Rpdj5gKTsKICB9KTsKfQoKCmNvbnN0IERFVEFJTF9UVEw9MzAqNjAqMTAwMDsKZnVuY3Rpb24gZGV0YWlsS2V5KGlkKXtyZXR1cm4gJ2NhbGNpb2FpX3YxMF9kZXRhaWxfJytpZH0KZnVuY3Rpb24gcmVhZERldGFpbENhY2hlKGlkKXsKIHRyeXsKICBjb25zdCB4PUpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oZGV0YWlsS2V5KGlkKSl8fCdudWxsJyk7CiAgaWYoIXh8fERhdGUubm93KCkteC50PkRFVEFJTF9UVEwpcmV0dXJuIG51bGw7CiAgcmV0dXJuIHguZDsKIH1jYXRjaHtyZXR1cm4gbnVsbH0KfQpmdW5jdGlvbiB3cml0ZURldGFpbENhY2hlKGlkLGQpewogdHJ5e2xvY2FsU3RvcmFnZS5zZXRJdGVtKGRldGFpbEtleShpZCksSlNPTi5zdHJpbmdpZnkoe3Q6RGF0ZS5ub3coKSxkfSkpfWNhdGNoe30KfQphc3luYyBmdW5jdGlvbiBsb2FkRGV0YWlscyhpZCxidG4pewogY29uc3QgcGFuZWw9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2RldGFpbHMtJytpZCk7CiBpZihwYW5lbC5zdHlsZS5kaXNwbGF5PT09J2Jsb2NrJyl7cGFuZWwuc3R5bGUuZGlzcGxheT0nbm9uZSc7cmV0dXJufQogcGFuZWwuc3R5bGUuZGlzcGxheT0nYmxvY2snOwogY29uc3QgY2FjaGVkPXJlYWREZXRhaWxDYWNoZShpZCk7CiBpZihjYWNoZWQpe3JlbmRlckRldGFpbHMocGFuZWwsY2FjaGVkLHRydWUpO3JldHVybn0KIHBhbmVsLmlubmVySFRNTD0nPHNwYW4gY2xhc3M9Im11dGVkIj5DYXJpY2FtZW50byBkZXR0YWdsaeKApjwvc3Bhbj4nOwogYnRuLmRpc2FibGVkPXRydWU7CiB0cnl7CiAgIGNvbnN0IHI9YXdhaXQgZmV0Y2goJy9hcGkvZGV0YWlscz9maXh0dXJlPScrZW5jb2RlVVJJQ29tcG9uZW50KGlkKSk7CiAgIGNvbnN0IGo9YXdhaXQgci5qc29uKCk7CiAgIGlmKCFyLm9rfHwhai5vayl7cGFuZWwuaW5uZXJIVE1MPSc8Yj5EZXR0YWdsaSBub24gZGlzcG9uaWJpbGk8L2I+PGJyPjxzcGFuIGNsYXNzPSJtdXRlZCI+JytlKGoubWVzc2FnZXx8JycpKyc8L3NwYW4+JztyZXR1cm59CiAgIHdyaXRlRGV0YWlsQ2FjaGUoaWQsaik7CiAgIHJlbmRlckRldGFpbHMocGFuZWwsaixmYWxzZSk7CiB9Y2F0Y2goeCl7cGFuZWwuaW5uZXJIVE1MPSc8Yj5FcnJvcmU8L2I+PGJyPjxzcGFuIGNsYXNzPSJtdXRlZCI+JytlKHgubWVzc2FnZSkrJzwvc3Bhbj4nfQogZmluYWxseXtidG4uZGlzYWJsZWQ9ZmFsc2V9Cn0KZnVuY3Rpb24gcmVuZGVyRGV0YWlscyhwYW5lbCxqLGNhY2hlKXsKIGNvbnN0IG89ai5vZGRzfHx7fSwgaW5qPWouaW5qdXJpZXN8fFtdLCBsdT1qLmxpbmV1cHN8fFtdOwogbGV0IG9kZHNIdG1sPSc8c3BhbiBjbGFzcz0ibXV0ZWQiPlF1b3RlIDFYMiBub24gZGlzcG9uaWJpbGkuPC9zcGFuPic7CiBpZihvLmhvbWV8fG8uZHJhd3x8by5hd2F5KXsKICAgb2Rkc0h0bWw9YDxkaXYgY2xhc3M9Im9kZHNncmlkIj48ZGl2IGNsYXNzPSJvZGQiPjxiPjE8L2I+PGJyPiR7ZShvLmhvbWV8fCfigJQnKX08L2Rpdj48ZGl2IGNsYXNzPSJvZGQiPjxiPlg8L2I+PGJyPiR7ZShvLmRyYXd8fCfigJQnKX08L2Rpdj48ZGl2IGNsYXNzPSJvZGQiPjxiPjI8L2I+PGJyPiR7ZShvLmF3YXl8fCfigJQnKX08L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPSJtdXRlZCI+JHtlKG8uYm9va21ha2VyfHwnQm9va21ha2VyJyl9ICR7by51cGRhdGVkPyfigKIgJytlKG8udXBkYXRlZCk6Jyd9PC9kaXY+YDsKIH0KIGxldCBpbmp1cmllc0h0bWw9aW5qLmxlbmd0aD9pbmouc2xpY2UoMCwxNikubWFwKHg9PmA8ZGl2IGNsYXNzPSJwbGF5ZXJsaW5lIj4ke2UoeC50ZWFtKX0g4oCUIDxiPiR7ZSh4LnBsYXllcil9PC9iPiA8c3BhbiBjbGFzcz0ibXV0ZWQiPiR7ZSh4LnJlYXNvbnx8J2Fzc2VudGUvZHViYmlvJyl9PC9zcGFuPjwvZGl2PmApLmpvaW4oJycpOic8c3BhbiBjbGFzcz0ibXV0ZWQiPk5lc3N1bmEgaW5mb3JtYXppb25lIHN1IGFzc2VudGkvaW5mb3J0dW5hdGkgZGlzcG9uaWJpbGUgcGVyIHF1ZXN0YSBwYXJ0aXRhLjwvc3Bhbj4nOwogbGV0IGxpbmV1cHNIdG1sPWx1Lmxlbmd0aD9sdS5tYXAodD0+YDxkaXYgY2xhc3M9InNlY3Rpb24iPjxiPiR7ZSh0LnRlYW0pfSAke3QuZm9ybWF0aW9uPycoJytlKHQuZm9ybWF0aW9uKSsnKSc6Jyd9PC9iPiR7KHQuc3RhcnRYSXx8W10pLnNsaWNlKDAsMTEpLm1hcChwPT5gPGRpdiBjbGFzcz0icGxheWVybGluZSI+JHtlKHApfTwvZGl2PmApLmpvaW4oJycpfTwvZGl2PmApLmpvaW4oJycpOic8c3BhbiBjbGFzcz0ibXV0ZWQiPkZvcm1hemlvbmkgdWZmaWNpYWxpIG5vbiBhbmNvcmEgZGlzcG9uaWJpbGkuIFZlbmdvbm8gbW9zdHJhdGUgYXBwZW5hIEFQSS1Gb290YmFsbCBsZSBwdWJibGljYSBwZXIgbGEgZ2FyYS48L3NwYW4+JzsKIGNvbnN0IG09bW9kZWxCeUZpeHR1cmVbai5maXh0dXJlXTsKIGxldCB2YWx1ZUh0bWw9JzxzcGFuIGNsYXNzPSJtdXRlZCI+VkFMVUUgbm9uIGNhbGNvbGFiaWxlOiBtYW5jYSB1biBwcm9ub3N0aWNvIGRlbCBtb2RlbGxvIG8gbGUgcXVvdGUgMVgyLjwvc3Bhbj4nOwogaWYobSAmJiAhbS5pbnN1ZmZpY2llbnQgJiYgby5ob21lICYmIG8uZHJhdyAmJiBvLmF3YXkpewogICBjb25zdCBvZGRzPVtOdW1iZXIoby5ob21lKSxOdW1iZXIoby5kcmF3KSxOdW1iZXIoby5hd2F5KV07CiAgIGNvbnN0IHByb2JzPVttLnAxLG0ucHgsbS5wMl07CiAgIGlmKG9kZHMuZXZlcnkoeD0+TnVtYmVyLmlzRmluaXRlKHgpJiZ4PjEpICYmIHByb2JzLmV2ZXJ5KHg9Pk51bWJlci5pc0Zpbml0ZSh4KSYmeD4wKSl7CiAgICAgY29uc3QgcmF3PW9kZHMubWFwKHg9PjEveCksIHN1bT1yYXcucmVkdWNlKChhLGIpPT5hK2IsMCk7CiAgICAgY29uc3QgbWFya2V0PXJhdy5tYXAoeD0+eC9zdW0pOwogICAgIGNvbnN0IGxhYmVscz1bJzEnLCdYJywnMiddOwogICAgIGNvbnN0IHJvd3M9bGFiZWxzLm1hcCgobGFiLGkpPT57CiAgICAgICBjb25zdCBlZGdlPShwcm9ic1tpXS1tYXJrZXRbaV0pKjEwMDsKICAgICAgIGNvbnN0IGV2PShwcm9ic1tpXSpvZGRzW2ldLTEpKjEwMDsKICAgICAgIGNvbnN0IGZhaXI9MS9wcm9ic1tpXTsKICAgICAgIGNvbnN0IGNscz1ldj49NT8ncG9zaXRpdmUnOicnOwogICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPSJ2YWx1ZXJvdyAke2Nsc30iPjxkaXY+PGI+JHtsYWJ9PC9iPjwvZGl2PjxkaXY+TW9kLiAkeyhwcm9ic1tpXSoxMDApLnRvRml4ZWQoMSl9JTwvZGl2PjxkaXY+TWVyYy4gJHsobWFya2V0W2ldKjEwMCkudG9GaXhlZCgxKX0lPC9kaXY+PGRpdj5FViAke2V2Pj0wPycrJzonJ30ke2V2LnRvRml4ZWQoMSl9JTwvZGl2PjwvZGl2PmA7CiAgICAgfSkuam9pbignJyk7CiAgICAgdmFsdWVIdG1sPWA8ZGl2IGNsYXNzPSJ2YWx1ZWJveCI+JHtyb3dzfTwvZGl2PjxkaXYgY2xhc3M9Indhcm5pbmciPuKAnFZBTFVF4oCdID0gcHJvYmFiaWxpdMOgIGRlbCBtb2RlbGxvIHN1cGVyaW9yZSBhIHF1ZWxsYSBpbXBsaWNpdGEgbmVsbGUgcXVvdGUuIE5vbiBlcXVpdmFsZSBhIGVzaXRvIGNlcnRvIG7DqSBhIGNvbnNpZ2xpbyBkaSBwdW50YXRhLjwvZGl2PmA7CiAgIH0KIH0KIHBhbmVsLmlubmVySFRNTD1gPGRpdiBjbGFzcz0ibXV0ZWQiPiR7Y2FjaGU/J0RhdGkgZGFsbGEgY2FjaGUgbG9jYWxlJzonRGF0aSBhZ2dpb3JuYXRpJ30g4oCiICR7ai5hcGlDYWxsc30gY2hpYW1hdGUgQVBJJHtqLnJlcXVlc3RzUmVtYWluaW5nIT1udWxsPycg4oCiICcrai5yZXF1ZXN0c1JlbWFpbmluZysnIHJpY2hpZXN0ZSByaW1hc3RlIG9nZ2knOicnfTwvZGl2PgogPGRpdiBjbGFzcz0ic2VjdGlvbiI+PGI+UXVvdGUgYm9va21ha2VyPC9iPiR7b2Rkc0h0bWx9PC9kaXY+CiA8ZGl2IGNsYXNzPSJzZWN0aW9uIj48Yj5Db25mcm9udG8gbW9kZWxsbyDihpQgbWVyY2F0byAoVkFMVUUpPC9iPiR7dmFsdWVIdG1sfTwvZGl2PgogPGRpdiBjbGFzcz0ic2VjdGlvbiI+PGI+QXNzZW50aSAvIGluZm9ydHVuaTwvYj4ke2luanVyaWVzSHRtbH08L2Rpdj4KIDxkaXYgY2xhc3M9InNlY3Rpb24iPjxiPkZvcm1hemlvbmkgdWZmaWNpYWxpPC9iPiR7bGluZXVwc0h0bWx9PC9kaXY+YDsKfQoKZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlYWd1ZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsKCk9PmxvYWQoZmFsc2UpKTsKbG9hZChmYWxzZSk7Cjwvc2NyaXB0Pgo8L21haW4+PC9ib2R5PjwvaHRtbD4=";

const Analyze = (() => {
const API="https://v3.football.api-sports.io";

const LEAGUES={
 "135":{name:"Serie A",type:"domestic"},"136":{name:"Serie B",type:"domestic"},
 "39":{name:"Premier League",type:"domestic"},"140":{name:"La Liga",type:"domestic"},
 "78":{name:"Bundesliga",type:"domestic"},"61":{name:"Ligue 1",type:"domestic"},
 "88":{name:"Eredivisie",type:"domestic"},"94":{name:"Primeira Liga",type:"domestic"},
 "2":{name:"Champions League",type:"europe"},"3":{name:"Europa League",type:"europe"}
};

// Country -> principal domestic league. Used only for European competitions.
const COUNTRY_LEAGUE={
 "England":39,"Spain":140,"Germany":78,"France":61,"Italy":135,"Netherlands":88,"Portugal":94,
 "Belgium":144,"Scotland":179,"Austria":218,"Switzerland":207,"Turkey":203,"Greece":197,
 "Denmark":119,"Norway":103,"Sweden":113,"Poland":106,"Czech-Republic":345,"Czech Republic":345,
 "Croatia":210,"Serbia":286,"Ukraine":333,"Romania":283,"Hungary":271,"Slovakia":332,
 "Slovenia":373,"Cyprus":318,"Israel":383
};

async function legacyHandler(event, env){
 const key=env.API_FOOTBALL_KEY;if(!key)return out(500,{ok:false,message:"API key mancante"});
 const league=String((event.queryStringParameters||{}).league||"135");
 const cfg=LEAGUES[league];if(!cfg)return out(400,{ok:false,message:"Campionato non supportato"});
 const now=new Date(),cur=now.getUTCMonth()>=6?now.getUTCFullYear():now.getUTCFullYear()-1,prev=cur-1;
 const from=now.toISOString().slice(0,10),to=new Date(now.getTime()+14*864e5).toISOString().slice(0,10);

 try{
   if(cfg.type==="europe") return await europeanModel(league,cfg,key,cur,prev,from,to);
   return await domesticModel(league,cfg,key,cur,prev,from,to);
 }catch(e){return out(500,{ok:false,message:e.message})}
}

async function domesticModel(league,cfg,key,cur,prev,from,to){
 const [up,curr,old]=await Promise.all([
   get(`/fixtures?league=${league}&season=${cur}&from=${from}&to=${to}&timezone=Europe%2FRome`,key),
   get(`/fixtures?league=${league}&season=${cur}&timezone=Europe%2FRome`,key),
   get(`/fixtures?league=${league}&season=${prev}&timezone=Europe%2FRome`,key)
 ]);
 const bad=[up,curr,old].find(x=>!x.ok);
 if(bad)return out(502,{ok:false,message:"API-Football ha restituito un errore"});

 const cf=finished(curr.data.response||[]);
 const pf=finished(old.data.response||[]);
 const cl=avg(cf), pl=avg(pf);
 const leagueCurrent=leagueOverall(cf), leaguePrev=leagueOverall(pf);

 const matches=(up.data.response||[]).filter(pending).map(x=>{
   const homeId=x.teams.home.id, awayId=x.teams.away.id;

   const hcVenue=stats(cf,homeId,true);
   const acVenue=stats(cf,awayId,false);
   const hpVenue=stats(pf,homeId,true);
   const apVenue=stats(pf,awayId,false);

   const hcAll=teamAllStats(cf,homeId);
   const acAll=teamAllStats(cf,awayId);
   const hpAll=teamAllStats(pf,homeId);
   const apAll=teamAllStats(pf,awayId);

   const homeNew=!hpAll.n, awayNew=!apAll.n;

   // Overall team quality (not only one home/away match).
   const hCurPower=powerFromStats(hcAll,leagueCurrent);
   const aCurPower=powerFromStats(acAll,leagueCurrent);
   const hPrevPower=homeNew?1:powerFromStats(hpAll,leaguePrev);
   const aPrevPower=awayNew?1:powerFromStats(apAll,leaguePrev);

   const hW=currentOverallWeight(hcAll.n);
   const aW=currentOverallWeight(acAll.n);

   let homePower=blendPower(hPrevPower,hCurPower,hW);
   let awayPower=blendPower(aPrevPower,aCurPower,aW);

   // Promoted/new teams start close to league average, then earn their rating.
   if(homeNew){
     const promotedW=Math.min(.22, .04 + hcAll.n*.025);
     homePower=clamp(blend(1,hCurPower,promotedW), promotedFloor(hcAll.n), promotedCeil(hcAll.n));
   }
   if(awayNew){
     const promotedW=Math.min(.22, .04 + acAll.n*.025);
     awayPower=clamp(blend(1,aCurPower,promotedW), promotedFloor(acAll.n), promotedCeil(acAll.n));
   }

   // Venue attack/defence is only a modifier, heavily regressed early on.
   const hAtk=blendedVenueFactor(hcVenue,hpVenue,cl.home,pl.home,"attack");
   const hDef=blendedVenueFactor(hcVenue,hpVenue,cl.away,pl.away,"defense");
   const aAtk=blendedVenueFactor(acVenue,apVenue,cl.away,pl.away,"attack");
   const aDef=blendedVenueFactor(acVenue,apVenue,cl.home,pl.home,"defense");

   let lh=cl.home * homePower * (1/awayPower) * hAtk * aDef;
   let la=cl.away * awayPower * (1/homePower) * aAtk * hDef;

   // Recent form has only a small bounded influence.
   const hr=recent(cf,homeId), ar=recent(cf,awayId);
   const hf=Math.min(1,hcAll.n/8), af=Math.min(1,acAll.n/8);
   lh*=1+((hr-.5)*.10*hf);
   la*=1+((ar-.5)*.10*af);

   // Low-sample predictions are shrunk toward normal league scoring.
   const sample=Math.min(hcAll.n,acAll.n);
   const certainty=Math.min(1,sample/10);
   lh=blend(cl.home,lh,.35+.65*certainty);
   la=blend(cl.away,la,.35+.65*certainty);

   // New/promoted teams get one extra layer of shrinkage until the sample grows.
   if(homeNew||awayNew){
     const promotedCertainty=Math.min(1,sample/12);
     lh=blend(cl.home,lh,.30+.50*promotedCertainty);
     la=blend(cl.away,la,.30+.50*promotedCertainty);
   }

   // Conservative caps.
   lh=clamp(lh,.65,2.30);
   la=clamp(la,.55,2.15);

   
   const confidence=sample<3?"molto bassa":sample<6?"bassa":sample<10?"media":"buona";

   let note="";
   if(homeNew&&awayNew) note="Entrambe senza storico nella stessa lega: Power Rating iniziale fortemente regredito verso la media.";
   else if(homeNew) note=`${x.teams.home.name}: nessuno storico nella stessa lega; Power Rating iniziale conservativo.`;
   else if(awayNew) note=`${x.teams.away.name}: nessuno storico nella stessa lega; Power Rating iniziale conservativo.`;

   const explain=[
     `Power Rating: ${x.teams.home.name} ${homePower.toFixed(2)} • ${x.teams.away.name} ${awayPower.toFixed(2)} (1.00 = media lega).`,
     `${x.teams.home.name}: ${hcAll.n} gare attuali complessive, ${rate(hcAll.gf,hcAll.n)} gol fatti/gara, ${rate(hcAll.ga,hcAll.n)} subiti/gara.`,
     `${x.teams.away.name}: ${acAll.n} gare attuali complessive, ${rate(acAll.gf,acAll.n)} gol fatti/gara, ${rate(acAll.ga,acAll.n)} subiti/gara.`,
     `Casa/trasferta usati solo come correttivo: ${hcVenue.n} gare casa ${x.teams.home.name}, ${acVenue.n} gare fuori ${x.teams.away.name}.`,
     `Forma ultime 5: ${x.teams.home.name} ${formLabel(hr)} • ${x.teams.away.name} ${formLabel(ar)}.`,
     `Affidabilità stagione corrente: ${confidence}. Storico precedente: ${pf.length} partite di lega.`
   ];

   return pack(x,model(lh,la,
     `Power Rating + storico + forma • peso stagione attuale ${Math.round(Math.min(hW,aW)*100)}%`,
     note,explain,homePower,awayPower,confidence));
 });

 return out(200,{ok:true,matches,meta:{leagueName:cfg.name,apiCalls:3,version:'1.0',requestsRemaining:lastRequestsRemaining}});
}

async function europeanModel(league,cfg,key,cur,prev,from,to){
 // 1 call: all fixtures in the European competition.
 // 1 call: all participating teams with country metadata.
 const [euroR,teamsR]=await Promise.all([
   get(`/fixtures?league=${league}&season=${cur}&timezone=Europe%2FRome`,key),
   get(`/teams?league=${league}&season=${cur}`,key)
 ]);
 const bad=[euroR,teamsR].find(x=>!x.ok);
 if(bad)return out(502,{ok:false,message:"API-Football ha restituito un errore sui dati europei"});

 const allEuro=euroR.data.response||[];
 const upcoming=allEuro.filter(x=>{
   if(!pending(x))return false;
   const d=String(x.fixture?.date||"").slice(0,10);
   return d>=from && d<=to;
 });
 const ef=finished(allEuro);
 const euroAvg=avg(ef);

 const norm=s=>String(s||"")
   .toLowerCase()
   .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
   .replace(/ß/g,"ss").replace(/ø/g,"o")
   .replace(/\b(fc|cf|kv|afc|sc|fk|ac|as|rc|vfb|rb)\b/g,"")
   .replace(/[^a-z0-9]/g,"");

 const participantMeta=new Map();
 for(const x of teamsR.data.response||[]){
   const t=x.team||{};
   participantMeta.set(Number(t.id),{
     id:Number(t.id),
     name:t.name||"",
     country:t.country||x.country?.name||""
   });
 }

 const teams=[...new Map(
   upcoming.flatMap(x=>[
     [Number(x.teams.home.id),{id:Number(x.teams.home.id),name:x.teams.home.name}],
     [Number(x.teams.away.id),{id:Number(x.teams.away.id),name:x.teams.away.name}]
   ])
 ).values()];

 const LOCAL_NAME_LEAGUE={
   "realmadrid":140,"barcelona":140,"atleticomadrid":140,"atleticodemadrid":140,"villarreal":140,"realbetis":140,
   "inter":135,"intermilan":135,"juventus":135,"napoli":135,"milan":135,"acmilan":135,"roma":135,"asroma":135,
   "astonvilla":39,"arsenal":39,"liverpool":39,"manchestercity":39,"manchesterunited":39,"chelsea":39,"tottenham":39,
   "bayernmunchen":78,"bayernmunich":78,"borussiadortmund":78,"stuttgart":78,"leipzig":78,
   "parissaintgermain":61,"psg":61,"lille":61,"lens":61,
   "psv":88,"psveindhoven":88,"feyenoord":88,"ajax":88,
   "porto":94,"fcporto":94,"benfica":94,"sporting":94,"sportingcp":94,
   "clubbrugge":144,"clubbruggekv":144,
   "aekathens":197,"aekathensfc":197,"olympiacos":197,"panathinaikos":197,
   "lask":218,"lasklinz":218,"salzburg":218,
   "viking":103,"bodoglimt":103,
   "galatasaray":203,"fenerbahce":203,"besiktas":203,
   "shakhtardonetsk":333,"dynamokyiv":333,
   "slaviapraha":345,"slaviaprague":345,
   "slovanbratislava":332
 };

 const LEAGUE_STRENGTH={
   39:1.10,140:1.07,135:1.06,78:1.05,61:1.03,94:0.99,88:0.98,
   203:0.97,144:0.95,333:0.95,218:0.93,345:0.93,207:0.93,103:0.92,
   197:0.92,179:0.94,119:0.93,106:0.92,332:0.90,286:0.90,210:0.92,
   283:0.89,271:0.89,373:0.88,318:0.88,383:0.90,113:0.92
 };

 const leagueName=id=>{
   const known={
     39:"Premier League",140:"La Liga",135:"Serie A",78:"Bundesliga",61:"Ligue 1",94:"Primeira Liga",
     88:"Eredivisie",144:"Jupiler Pro League",179:"Scottish Premiership",218:"Austrian Bundesliga",
     207:"Swiss Super League",203:"Süper Lig",197:"Super League Greece",119:"Danish Superliga",
     103:"Eliteserien",113:"Allsvenskan",106:"Ekstraklasa",345:"Czech Liga",210:"HNL",
     286:"Serbian SuperLiga",333:"Ukrainian Premier League",283:"Romanian Liga I",
     271:"Hungarian NB I",332:"Slovak Super Liga",373:"Slovenian PrvaLiga",318:"Cypriot First Division",
     383:"Israeli Premier League"
   };
   return known[id]||`League ${id}`;
 };

 const teamLeague={};
 for(const t of teams){
   const meta=participantMeta.get(t.id)||{};
   const byCountry=COUNTRY_LEAGUE[meta.country]||null;
   const byName=LOCAL_NAME_LEAGUE[norm(t.name)]||null;
   const byId=TEAM_DOMESTIC_LEAGUE[t.id]||null;
   const lid=byCountry||byName||byId;
   if(lid)teamLeague[t.id]={id:Number(lid),name:leagueName(Number(lid)),country:meta.country||""};
 }

 const leagueIds=[...new Set(Object.values(teamLeague).map(x=>x.id))];

 // September/October: use previous full domestic season as stable prior.
 // November onward: use current season.
 const month=Number(String(from).slice(5,7)||9);
 const baseSeason=month<=10?prev:cur;
 const leagueFixtures={};

 await Promise.all(leagueIds.map(async lid=>{
   const r=await get(`/fixtures?league=${lid}&season=${baseSeason}&timezone=Europe%2FRome`,key);
   leagueFixtures[lid]=r.ok?finished(r.data.response||[]):[];
 }));

 function teamStatsFromLeague(fs,team){
   const tn=norm(team.name);
   let n=0,gf=0,ga=0,w=0,d=0;
   for(const f of fs||[]){
     const hid=Number(f.teams?.home?.id), aid=Number(f.teams?.away?.id);
     const hn=norm(f.teams?.home?.name), an=norm(f.teams?.away?.name);
     const home=hid===Number(team.id)||hn===tn||hn.includes(tn)||tn.includes(hn);
     const away=aid===Number(team.id)||an===tn||an.includes(tn)||tn.includes(an);
     if(!home&&!away)continue;
     const hg=Number(f.goals?.home), ag=Number(f.goals?.away);
     if(!Number.isFinite(hg)||!Number.isFinite(ag))continue;
     const a=home?hg:ag,b=home?ag:hg;
     n++;gf+=a;ga+=b;if(a>b)w++;else if(a===b)d++;
   }
   if(!n)return null;
   return{n,gf,ga,pts:w*3+d};
 }

 // If a club is not present in previous domestic season (rare/promoted), only then fetch
 // the current season for that league. This avoids extra calls for everyone.
 const unresolvedLeagues=new Set();
 for(const t of teams){
   const dl=teamLeague[t.id];
   if(!dl)continue;
   if(!teamStatsFromLeague(leagueFixtures[dl.id],t) && baseSeason===prev)unresolvedLeagues.add(dl.id);
 }
 const currentFallback={};
 await Promise.all([...unresolvedLeagues].map(async lid=>{
   const r=await get(`/fixtures?league=${lid}&season=${cur}&timezone=Europe%2FRome`,key);
   currentFallback[lid]=r.ok?finished(r.data.response||[]):[];
 }));

 function domesticPower(team){
   const dl=teamLeague[team.id];
   if(!dl)return{available:false,reason:"campionato domestico non identificato"};
   let s=teamStatsFromLeague(leagueFixtures[dl.id]||[],team);
   let seasonUsed=baseSeason;
   let promoted=false;
   if(!s && currentFallback[dl.id]){
     s=teamStatsFromLeague(currentFallback[dl.id],team);
     seasonUsed=cur;promoted=true;
   }
   if(!s)return{available:false,reason:"dati domestici reali non recuperati",league:dl};

   const ppg=s.pts/s.n,gd=(s.gf-s.ga)/s.n;
   let within=clamp(1+.15*(ppg-1.35)+.09*gd,.72,1.40);
   if(promoted){
     const w=Math.min(.22,currentOverallWeight(s.n));
     within=clamp(1*(1-w)+within*w,.88,1.15);
   }
   const coeff=Number(LEAGUE_STRENGTH[dl.id]||1);
   return{
     available:true,
     value:clamp(within*coeff,.72,1.45),
     games:s.n,
     season:seasonUsed,
     league:dl,
     promoted,
     coeff
   };
 }

 const matches=upcoming.map(x=>{
   const ht={id:Number(x.teams.home.id),name:x.teams.home.name};
   const at={id:Number(x.teams.away.id),name:x.teams.away.name};
   const hp=domesticPower(ht),ap=domesticPower(at);
   const hs=teamAllStats(ef,ht.id),as=teamAllStats(ef,at.id);

   if(!hp.available||!ap.available){
     const missing=[];
     if(!hp.available)missing.push(`${ht.name}: ${hp.reason}`);
     if(!ap.available)missing.push(`${at.name}: ${ap.reason}`);
     return pack(x,{
       insufficient:true,
       reason:"Non ci sono abbastanza dati reali per pubblicare percentuali affidabili.",
       explain:[
         ...missing,
         `Competizione europea: ${cfg.name}.`,
         `Nessuna percentuale viene inventata quando manca la base domestica.`
       ]
     });
   }

   // European form is a small correction only when real completed matches exist.
   const he=hs.n?rating(hs):hp.value, ae=as.n?rating(as):ap.value;
   const hw=hs.n>=3?.88:hs.n>0?.94:1;
   const aw=as.n>=3?.88:as.n>0?.94:1;
   const hc=clamp(hw*hp.value+(1-hw)*he,.72,1.45);
   const ac=clamp(aw*ap.value+(1-aw)*ae,.72,1.45);

   // Competition scoring baseline falls back to neutral 1.45 / 1.25 when no completed games exist.
   const baseHome=ef.length?euroAvg.home:1.45;
   const baseAway=ef.length?euroAvg.away:1.25;
   let lh=baseHome*clamp(hc/ac,.70,1.38);
   let la=baseAway*clamp(ac/hc,.70,1.38);
   lh=clamp(lh,.60,2.60);la=clamp(la,.50,2.40);

   const confidence=(hp.games>=20&&ap.games>=20)?"media-alta":"media";
   const explain=[
     `${ht.name}: ${hp.league.name}, ${hp.games} gare domestiche ${hp.season}, coefficiente lega ${hp.coeff.toFixed(2)}.`,
     `${at.name}: ${ap.league.name}, ${ap.games} gare domestiche ${ap.season}, coefficiente lega ${ap.coeff.toFixed(2)}.`,
     `Power Rating: ${ht.name} ${hp.value.toFixed(2)} • ${at.name} ${ap.value.toFixed(2)}.`,
     `Gare europee concluse correnti: ${ht.name} ${hs.n} • ${at.name} ${as.n}.`,
     `L'Europa modifica poco il rating finché il campione europeo è ridotto.`,
     `Affidabilità: ${confidence}.`
   ];

   return pack(x,model(
     lh,la,
     `${cfg.name}: forza domestica + coefficiente lega + forma europea reale`,
     "",explain,hc,ac,confidence
   ));
 });

 return out(200,{
   ok:true,
   matches,
   meta:{
     leagueName:cfg.name,
     apiCalls:2+leagueIds.length+unresolvedLeagues.size,
     version:"1.0",
     model:"Calcio AI 1.0",
     requestsRemaining:lastRequestsRemaining
   }
 });
}

function pack(x,analysis){return{id:x.fixture.id,date:x.fixture.date,home:x.teams.home,away:x.teams.away,analysis}}
function pending(x){return !["FT","AET","PEN"].includes(x.fixture.status.short)}
let lastRequestsRemaining=null;

async function get(path,key){
 const r=await fetch(API+path,{headers:{"x-apisports-key":key}});
 const rem=r.headers.get("x-ratelimit-requests-remaining");
 if(rem!=null && rem!=="") lastRequestsRemaining=Number(rem);
 let data;try{data=await r.json()}catch{return{ok:false,status:r.status}}
 const has=data.errors&&(Array.isArray(data.errors)?data.errors.length:Object.keys(data.errors).length);
 return (!r.ok||has)?{ok:false,status:r.status,errors:data.errors}:{ok:true,status:r.status,data};
}
function finished(a){return a.filter(x=>["FT","AET","PEN"].includes(x.fixture.status.short)&&x.goals.home!=null&&x.goals.away!=null)}
function avg(a){if(!a.length)return{home:1.45,away:1.15};let h=0,v=0;a.forEach(x=>{h+=x.goals.home;v+=x.goals.away});return{home:h/a.length,away:v/a.length}}
function stats(fs,id,home){const a=fs.filter(x=>(home?x.teams.home.id:x.teams.away.id)===id);return{n:a.length,gf:a.reduce((s,x)=>s+(home?x.goals.home:x.goals.away),0),ga:a.reduce((s,x)=>s+(home?x.goals.away:x.goals.home),0)}}
function teamAllStats(fs,id){const a=fs.filter(x=>x.teams.home.id===id||x.teams.away.id===id);let gf=0,ga=0,pts=0;for(const x of a){const h=x.teams.home.id===id,g=h?x.goals.home:x.goals.away,z=h?x.goals.away:x.goals.home;gf+=g;ga+=z;pts+=g>z?3:g===z?1:0}return{n:a.length,gf,ga,pts}}
function rating(s){if(!s.n)return 1;const gd=(s.gf-s.ga)/s.n,ppg=s.pts/s.n;return clamp(1+0.10*gd+0.10*(ppg-1.35),.72,1.32)}
function strengthAttack(s,avgGF){if(!s.n)return 1;return clamp((s.gf/s.n)/(avgGF||1),.60,1.55)}
function strengthDefense(s,avgGA){if(!s.n)return 1;return clamp((s.ga/s.n)/(avgGA||1),.60,1.55)}
function recent(fs,id){const a=fs.filter(x=>x.teams.home.id===id||x.teams.away.id===id).sort((x,y)=>new Date(y.fixture.date)-new Date(x.fixture.date)).slice(0,5);if(!a.length)return .5;let p=0;a.forEach(x=>{const h=x.teams.home.id===id,g=h?x.goals.home:x.goals.away,z=h?x.goals.away:x.goals.home;p+=g>z?3:g===z?1:0});return p/(a.length*3)}
function currentSeasonWeight(n){
 if(n<=0)return 0;
 if(n===1)return .05;
 if(n===2)return .08;
 if(n<=5)return .08+(n-2)*.033333;
 if(n<=10)return .18+(n-5)*.04;
 if(n<=15)return .38+(n-10)*.034;
 return .55;
}

function leagueOverall(fs){
 const teams={};
 for(const x of fs){
   for(const [id,gf,ga,pts] of [
     [x.teams.home.id,x.goals.home,x.goals.away,x.goals.home>x.goals.away?3:x.goals.home===x.goals.away?1:0],
     [x.teams.away.id,x.goals.away,x.goals.home,x.goals.away>x.goals.home?3:x.goals.away===x.goals.home?1:0]
   ]){
     if(!teams[id])teams[id]={n:0,gf:0,ga:0,pts:0};
     teams[id].n++;teams[id].gf+=gf;teams[id].ga+=ga;teams[id].pts+=pts;
   }
 }
 const vals=Object.values(teams);
 if(!vals.length)return {ppg:1.35,gdpg:0};
 return {
   ppg:vals.reduce((s,t)=>s+t.pts/t.n,0)/vals.length,
   gdpg:vals.reduce((s,t)=>s+(t.gf-t.ga)/t.n,0)/vals.length
 };
}
function powerFromStats(s,league){
 if(!s.n)return 1;
 const ppg=s.pts/s.n;
 const gd=(s.gf-s.ga)/s.n;
 return clamp(1 + .16*(ppg-league.ppg) + .10*(gd-league.gdpg), .72, 1.38);
}
function currentOverallWeight(n){
 // Structural strength changes slowly at the start of a season.
 if(n<=0)return 0;
 if(n<=3)return .03;
 if(n<=5)return .08;
 if(n<=8)return .15;
 if(n<=12)return .25;
 if(n<=16)return .35;
 return .50;
}
function promotedFloor(n){
 if(n<=3)return .96;
 if(n<=6)return .93;
 if(n<=10)return .90;
 return .86;
}
function promotedCeil(n){
 if(n<=3)return 1.04;
 if(n<=6)return 1.07;
 if(n<=10)return 1.10;
 return 1.16;
}
function blendPower(prev,cur,w){return clamp(prev*(1-w)+cur*w,.72,1.38)}
function blendedVenueFactor(cur,prev,curAvg,prevAvg,type){
 const cw=Math.min(.22,cur.n/18);
 const curFactor=venueFactor(cur,curAvg,type);
 const prevFactor=prev.n?venueFactor(prev,prevAvg,type):1;
 return clamp(prevFactor*(1-cw)+curFactor*cw,.88,1.12);
}
function venueFactor(s,avg,type){
 if(!s.n||!avg)return 1;
 const raw=(type==="attack"?s.gf/s.n:s.ga/s.n)/avg;
 // defense factor <1 is good defense, which should suppress opponent xG.
 return clamp(raw,.82,1.18);
}
const DOMESTIC_LEAGUE_IDS=new Set([
  39,40,41,42,43,135,136,140,141,78,79,61,62,88,89,94,95,
  144,145,179,180,218,219,207,203,197,119,103,113,106,345,
  210,286,333,283,271,332,373,318,383
]);

function domesticOnly(fs){
 return fs.filter(x=>DOMESTIC_LEAGUE_IDS.has(x.league.id));
}
function fixturePower(s){
 if(!s.n)return null;
 const ppg=s.pts/s.n;
 const gd=(s.gf-s.ga)/s.n;
 return clamp(1+.15*(ppg-1.35)+.09*gd,.72,1.40);
}
function europePowerFromFixtures(cur,prev){
 const c=fixturePower(cur),p=fixturePower(prev);
 if(c==null && p==null)return {available:false,value:1,currentGames:0,previousGames:0};
 if(p==null){
   const w=Math.min(.22,currentOverallWeight(cur.n));
   return {available:true,value:clamp(1*(1-w)+c*w,.88,1.15),currentGames:cur.n,previousGames:0};
 }
 if(c==null)return {available:true,value:p,currentGames:0,previousGames:prev.n};
 const w=currentOverallWeight(cur.n);
 return {
   available:true,
   value:clamp(p*(1-w)+c*w,.72,1.40),
   currentGames:cur.n,
   previousGames:prev.n
 };
}

const CHAMPIONS_NAME_LEAGUE={"aekathens":197,"aekathensfc":197,"lask":218,"lasklinz":218,"clubbrugge":144,"clubbruggekv":144,"astonvilla":39,"borussiadortmund":78,"villarreal":140,"porto":94,"fcporto":94,"manchestercity":39,"lille":61,"realbetis":140,"betis":140,"realmadrid":140,"inter":135,"intermilan":135,"barcelona":140,"fcbarcelona":140,"feyenoord":88,"stuttgart":78,"vfb stuttgart":78,"viking":103,"liverpool":39,"atleticomadrid":140,"atleticodemadrid":140,"parissaintgermain":61,"psg":61,"slovanbratislava":332,"sportingcp":94,"sportinglisbon":94,"sporting":94,"galatasaray":203,"napoli":135,"arsenal":39,"fenerbahce":203,"roma":135,"asroma":135,"psveindhoven":88,"psv":88,"shakhtardonetsk":333,"como":135,"leipzig":78,"rbleipzig":78,"bayernmunchen":78,"bayernmunich":78,"bodoglimt":103,"bodo/glimt":103,"manchesterunited":39,"sabah":419,"sabahfa":419,"slaviapraha":345,"slaviaprague":345,"lens":61,"rclens":61};
const CHAMPIONS_LEAGUE_NAMES={"39":"Premier League","61":"Ligue 1","78":"Bundesliga","88":"Eredivisie","94":"Primeira Liga","103":"Eliteserien","135":"Serie A","140":"La Liga","144":"Jupiler Pro League","197":"Super League Greece","203":"S\u00fcper Lig","218":"Austrian Bundesliga","332":"Slovak Super Liga","333":"Ukrainian Premier League","345":"Czech Liga","419":"Azerbaijan Premier League"};
const CHAMPIONS_LEAGUE_STRENGTH={"39":1.1,"140":1.07,"135":1.06,"78":1.05,"61":1.03,"94":0.99,"88":0.98,"203":0.97,"144":0.95,"218":0.93,"345":0.93,"103":0.92,"197":0.92,"332":0.9,"333":0.95,"419":0.88};
const TEAM_DOMESTIC_LEAGUE={"505":135,"489":135,"492":135,"497":135,"496":135,"487":135,"499":135,"502":135,"494":135,"503":135,"541":140,"529":140,"530":140,"536":140,"532":140,"548":140,"727":140,"531":140,"33":39,"40":39,"42":39,"47":39,"49":39,"50":39,"51":39,"52":39,"34":39,"39":39,"66":39,"157":78,"165":78,"168":78,"172":78,"173":78,"169":78,"161":78,"85":61,"81":61,"80":61,"91":61,"84":61,"79":61,"194":88,"197":88,"209":88,"201":88,"211":94,"212":94,"224":94,"569":144,"554":144,"555":144,"740":144,"1853":197,"1854":197,"1855":197,"1863":197,"571":218,"586":218,"585":218,"591":218,"328":103,"331":103,"329":103,"332":103,"400":119,"396":119,"393":119,"2032":207,"2036":207,"2037":207,"247":179,"248":179,"645":203,"611":203,"549":203,"556":345,"5550":345,"620":210,"598":286,"550":333,"2285":333,"347":106};
const DOMESTIC_LEAGUE_NAMES={"39":"Premier League","135":"Serie A","140":"La Liga","78":"Bundesliga","61":"Ligue 1","88":"Eredivisie","94":"Primeira Liga","144":"Jupiler Pro League","197":"Super League Greece","218":"Bundesliga Austria","103":"Eliteserien","119":"Superliga Denmark","207":"Super League Switzerland","179":"Premiership Scotland","203":"S\u00fcper Lig","345":"Czech Liga","210":"HNL Croatia","286":"Super Liga Serbia","333":"Premier League Ukraine","106":"Ekstraklasa"};
const TOP_DOMESTIC_PRIORITY=[
  39,135,140,78,61,88,94,136,144,179,218,207,203,197,119,103,113,106,345,
  210,286,333,283,271,332,373,318,383
];

function chooseDomesticLeague(resp){
 const candidates=[];
 for(const x of resp||[]){
   const l=x.league||{}, c=x.country||{};
   if(String(l.type||"").toLowerCase()!=="league")continue;
   if(String(c.name||"").toLowerCase()==="world")continue;

   const name=String(l.name||"").toLowerCase();
   if(/women|reserve|u19|u21|youth|academy|cup|super cup|champions|europa|conference/.test(name))continue;

   // Must have season coverage metadata if present.
   const seasons=x.seasons||[];
   const currentSeason=seasons.find(s=>s.current);
   if(seasons.length && !currentSeason && !seasons.some(s=>s.year))continue;

   candidates.push({id:l.id,name:l.name,country:c.name||""});
 }

 if(!candidates.length)return null;

 candidates.sort((a,b)=>{
   const ai=TOP_DOMESTIC_PRIORITY.indexOf(a.id), bi=TOP_DOMESTIC_PRIORITY.indexOf(b.id);
   const ar=ai<0?999:ai, br=bi<0?999:bi;

   if(ar!==br)return ar-br;

   // Secondary heuristic: first divisions usually have lower numeric suffix/shorter names.
   return String(a.name).length-String(b.name).length;
 });

 return candidates[0];
}

function filterLeague(fs,leagueId){
 return (fs||[]).filter(x=>x.league && Number(x.league.id)===Number(leagueId));
}

function parseTeamStatistics(r){
 if(!r)return null;

 const played=Number(r.fixtures?.played?.total ?? r.fixtures?.played?.home + r.fixtures?.played?.away ?? 0);
 const wins=Number(r.fixtures?.wins?.total ?? 0);
 const draws=Number(r.fixtures?.draws?.total ?? 0);
 const losses=Number(r.fixtures?.loses?.total ?? r.fixtures?.losses?.total ?? 0);

 const gf=Number(
   r.goals?.for?.total?.total ??
   ((r.goals?.for?.total?.home||0)+(r.goals?.for?.total?.away||0))
 );

 const ga=Number(
   r.goals?.against?.total?.total ??
   ((r.goals?.against?.total?.home||0)+(r.goals?.against?.total?.away||0))
 );

 if(!played)return null;

 return{
   n:played,
   wins,draws,losses,
   gf,ga,
   pts:wins*3+draws
 };
}

function statisticsPower(s){
 if(!s||!s.n)return null;
 const ppg=s.pts/s.n, gd=(s.gf-s.ga)/s.n;
 return clamp(1+.15*(ppg-1.35)+.09*gd,.72,1.40);
}

function powerFromTeamStatistics(cur,prev){
 const c=statisticsPower(cur),p=statisticsPower(prev);
 if(c==null&&p==null)return{available:false,value:1,currentGames:0,previousGames:0};
 if(p==null){
   const w=Math.min(.22,currentOverallWeight(cur.n));
   return{available:true,value:clamp(1*(1-w)+c*w,.88,1.15),currentGames:cur.n,previousGames:0};
 }
 if(c==null)return{available:true,value:p,currentGames:0,previousGames:prev.n};
 const w=currentOverallWeight(cur.n);
 return{
   available:true,
   value:clamp(p*(1-w)+c*w,.72,1.40),
   currentGames:cur.n,
   previousGames:prev.n
 };
}

function flattenStandings(resp){
 const out=[];
 for(const r of resp||[]){
   for(const league of (r.league?.standings||[])){
     for(const row of league||[])out.push(row);
   }
 }
 return out;
}
function findStanding(rows,id){return (rows||[]).find(r=>r.team&&r.team.id===id)||null}
function standingPower(row){
 if(!row)return null;
 const played=row.all?.played||0;
 if(!played)return {value:1,games:0};
 const pts=row.points||0;
 const gd=row.goalsDiff||0;
 const ppg=pts/played;
 const gdpg=gd/played;
 return {value:clamp(1+.14*(ppg-1.35)+.08*gdpg,.72,1.40),games:played};
}
function europeTeamPower(cur,prev){
 const c=standingPower(cur),p=standingPower(prev);
 if(!c&&!p)return {available:false,value:1,currentGames:0,previousAvailable:false};
 if(!p)return {available:true,value:clamp(1*(1-currentOverallWeight(c.games))+c.value*currentOverallWeight(c.games),.78,1.32),currentGames:c.games,previousAvailable:false};
 if(!c)return {available:true,value:p.value,currentGames:0,previousAvailable:true};
 const w=currentOverallWeight(c.games);
 return {available:true,value:clamp(p.value*(1-w)+c.value*w,.72,1.40),currentGames:c.games,previousAvailable:true};
}

function rate(v,n){return n?(v/n).toFixed(2):"n/d"}
function formLabel(v){
 if(v>=.67)return "alta";
 if(v>=.45)return "media";
 return "bassa";
}
function blend(v,prior,priorWeight){return v*(1-priorWeight)+prior*priorWeight}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function pois(k,l){let f=1;for(let i=2;i<=k;i++)f*=i;return Math.exp(-l)*Math.pow(l,k)/f}
function model(lh,la,method,note,explain=[],homePower=1,awayPower=1,confidence="bassa"){
 let o=0,d=0,t=0,ov15=0,ov25=0,ov35=0,b=0,s=[];
 for(let h=0;h<=9;h++)for(let a=0;a<=9;a++){
   const p=pois(h,lh)*pois(a,la);
   if(h>a)o+=p;else if(h===a)d+=p;else t+=p;
   if(h+a>1)ov15+=p;
   if(h+a>2)ov25+=p;
   if(h+a>3)ov35+=p;
   if(h>0&&a>0)b+=p;
   s.push({score:`${h}-${a}`,p});
 }
 const z=o+d+t;
 s.sort((x,y)=>y.p-x.p);
 const p1=o/z,px=d/z,p2=t/z;
 const dnb1=(p1+p2)>0?p1/(p1+p2):.5;
 const dnb2=(p1+p2)>0?p2/(p1+p2):.5;
 return{
   p1,px,p2,
   dc1x:p1+px,dc12:p1+p2,dcx2:px+p2,
   dnb1,dnb2,
   over15:ov15,under15:1-ov15,
   over:ov25,under:1-ov25,
   over35:ov35,under35:1-ov35,
   btts:b,noBtts:1-b,
   scores:s.slice(0,3),
   lh,la,method,note,explain,homePower,awayPower,confidence
 };
}
function out(statusCode,body){
 const headers={"content-type":"application/json"};
 if(statusCode>=200 && statusCode<300){
   // Netlify CDN cache: shared + durable to reduce Function invocations.
   headers["Cache-Control"]="public, max-age=1800, s-maxage=21600, stale-while-revalidate=86400";
   // Short browser cache; frontend also keeps a 30-minute local cache.
   headers["Cache-Control"]="public, max-age=1800, s-maxage=21600, stale-while-revalidate=86400";
 }else{
   headers["Cache-Control"]="no-store";
 }
 return{statusCode,headers,body:JSON.stringify(body)};
}


async function onRequest(context){
 const url=new URL(context.request.url);
 const cache=caches.default;
 const cacheKey=new Request(url.toString(),{method:"GET"});
 const cached=await cache.match(cacheKey);
 if(cached)return cached;
 const event={queryStringParameters:Object.fromEntries(url.searchParams.entries())};
 const result=await legacyHandler(event,context.env);
 const response=new Response(result.body,{status:result.statusCode,headers:result.headers});
 if(result.statusCode>=200&&result.statusCode<300){
   context.waitUntil(cache.put(cacheKey,response.clone()));
 }
 return response;
}

return { onRequest };
})();

const Details = (() => {
const API="https://v3.football.api-sports.io";
let lastRequestsRemaining=null;

async function legacyHandler(event, env){
 const key=env.API_FOOTBALL_KEY;
 if(!key)return out(500,{ok:false,message:"API key mancante"});
 const fixture=String((event.queryStringParameters||{}).fixture||"");
 if(!/^\d+$/.test(fixture))return out(400,{ok:false,message:"Fixture non valido"});

 try{
   // Lazy loading: these calls happen ONLY when user opens match details.
   const [oddsR,injR,lineR]=await Promise.all([
     get(`/odds?fixture=${fixture}`,key),
     get(`/injuries?fixture=${fixture}`,key),
     get(`/fixtures/lineups?fixture=${fixture}`,key)
   ]);

   const odds=parseOdds(oddsR.ok?oddsR.data.response:[]);
   const injuries=parseInjuries(injR.ok?injR.data.response:[]);
   const lineups=parseLineups(lineR.ok?lineR.data.response:[]);

   return out(200,{ok:true,fixture,odds,injuries,lineups,apiCalls:3,requestsRemaining:lastRequestsRemaining});
 }catch(e){
   return out(500,{ok:false,message:e.message});
 }
}

async function get(path,key){
 const r=await fetch(API+path,{headers:{"x-apisports-key":key}});
 const rem=r.headers.get("x-ratelimit-requests-remaining");
 if(rem!=null&&rem!=="")lastRequestsRemaining=Number(rem);
 let data;try{data=await r.json()}catch{return{ok:false,status:r.status}}
 const has=data.errors&&(Array.isArray(data.errors)?data.errors.length:Object.keys(data.errors).length);
 if(!r.ok||has)return{ok:false,status:r.status,errors:data.errors};
 return{ok:true,status:r.status,data};
}

function parseOdds(resp){
 // Pick the first available bookmaker's "Match Winner" market.
 for(const page of resp||[]){
   for(const bm of (page.bookmakers||[])){
     const bet=(bm.bets||[]).find(b=>String(b.name||"").toLowerCase().includes("match winner"));
     if(!bet)continue;
     const vals={};
     for(const v of bet.values||[]){
       const key=String(v.value||"").toLowerCase();
       if(key==="home")vals.home=v.odd;
       else if(key==="draw")vals.draw=v.odd;
       else if(key==="away")vals.away=v.odd;
     }
     if(vals.home||vals.draw||vals.away){
       return{...vals,bookmaker:bm.name||"",updated:page.update||""};
     }
   }
 }
 return{};
}

function parseInjuries(resp){
 return (resp||[]).map(x=>({
   team:x.team?.name||"",
   player:x.player?.name||"",
   reason:x.player?.reason||x.player?.type||""
 })).filter(x=>x.player);
}

function parseLineups(resp){
 return (resp||[]).map(x=>({
   team:x.team?.name||"",
   formation:x.formation||"",
   startXI:(x.startXI||[]).map(y=>y.player?.name).filter(Boolean)
 }));
}

function out(statusCode,body){
 const headers={"content-type":"application/json"};
 if(statusCode>=200&&statusCode<300){
   // Details change more often than base model but still should be cached.
   headers["Cache-Control"]="public, max-age=300, s-maxage=1800, stale-while-revalidate=7200";
   headers["Cache-Control"]="public, max-age=300, s-maxage=1800, stale-while-revalidate=7200";
 }else headers["Cache-Control"]="no-store";
 return{statusCode,headers,body:JSON.stringify(body)};
}

async function onRequest(context){
 const url=new URL(context.request.url);
 const cache=caches.default;
 const cacheKey=new Request(url.toString(),{method:"GET"});
 const cached=await cache.match(cacheKey);
 if(cached)return cached;
 const event={queryStringParameters:Object.fromEntries(url.searchParams.entries())};
 const result=await legacyHandler(event,context.env);
 const response=new Response(result.body,{status:result.statusCode,headers:result.headers});
 if(result.statusCode>=200&&result.statusCode<300){
   context.waitUntil(cache.put(cacheKey,response.clone()));
 }
 return response;
}

return { onRequest };
})();

function htmlResponse() {
  const binary = atob(INDEX_HTML_B64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new Response(bytes, {
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "public, max-age=3600"
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method !== "GET") return new Response("Method Not Allowed", {status:405});
    if (url.pathname === "/api/analyze") return Analyze.onRequest({request, env, waitUntil: p => ctx.waitUntil(p)});
    if (url.pathname === "/api/details") return Details.onRequest({request, env, waitUntil: p => ctx.waitUntil(p)});
    if (url.pathname === "/" || url.pathname === "/index.html") return htmlResponse();
    return new Response("Not Found", {status:404});
  }
};
