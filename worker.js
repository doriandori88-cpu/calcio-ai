const INDEX_HTML_B64 = "PCFkb2N0eXBlIGh0bWw+CjxodG1sIGxhbmc9Iml0Ij4KPGhlYWQ+CjxtZXRhIGNoYXJzZXQ9InV0Zi04Ij4KPG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCxpbml0aWFsLXNjYWxlPTEsdmlld3BvcnQtZml0PWNvdmVyIj4KPG1ldGEgbmFtZT0idGhlbWUtY29sb3IiIGNvbnRlbnQ9IiMwNzExMWYiPgo8dGl0bGU+Q2FsY2lvIEFJIDEuMjwvdGl0bGU+CjxzdHlsZT4KOnJvb3R7Y29sb3Itc2NoZW1lOmRhcms7LS1iZzojMDcxMTFmOy0tY2FyZDojMTExZDMxOy0tc29mdDojMTcyNzQyOy0tbGluZTojMmEzYzVjOy0tdGV4dDojZjRmN2ZiOy0tbXV0ZWQ6IzkzYTRiZjstLWFjY2VudDojNzJjZGY0Oy0tZ29vZDojOGNlOTlhOy0td2FybjojZmZkNDNifQoqe2JveC1zaXppbmc6Ym9yZGVyLWJveH1ib2R5e21hcmdpbjowO2JhY2tncm91bmQ6dmFyKC0tYmcpO2NvbG9yOnZhcigtLXRleHQpO2ZvbnQtZmFtaWx5Oi1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCJTZWdvZSBVSSIsc2Fucy1zZXJpZn0KbWFpbnttYXgtd2lkdGg6OTAwcHg7bWFyZ2luOmF1dG87cGFkZGluZzozMHB4IDE2cHggNjBweH1oMXtmb250LXNpemU6MzhweDttYXJnaW46MCAwIDZweH0uc3ViLC5tZXRhLC5zbWFsbCwubXV0ZWR7Y29sb3I6dmFyKC0tbXV0ZWQpfS5zdWJ7bWFyZ2luLXRvcDowfQouY29udHJvbHN7ZGlzcGxheTpmbGV4O2dhcDoxMHB4O2ZsZXgtd3JhcDp3cmFwO21hcmdpbjoxOHB4IDB9c2VsZWN0LGJ1dHRvbntib3JkZXI6MDtib3JkZXItcmFkaXVzOjE0cHg7cGFkZGluZzoxM3B4IDE0cHg7Zm9udC1zaXplOjE2cHh9CnNlbGVjdHtiYWNrZ3JvdW5kOiMxNDIyMzk7Y29sb3I6I2ZmZjttaW4td2lkdGg6MjMwcHg7ZmxleDoxfWJ1dHRvbntiYWNrZ3JvdW5kOnZhcigtLWFjY2VudCk7Zm9udC13ZWlnaHQ6NzUwO2NvbG9yOiMwNjRmNzg7Y3Vyc29yOnBvaW50ZXJ9YnV0dG9uOmRpc2FibGVke29wYWNpdHk6LjU1fQojc3RhdHVzLC5tYXRjaHttYXJnaW46MTZweCAwO3BhZGRpbmc6MTZweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6MThweDtiYWNrZ3JvdW5kOnZhcigtLWNhcmQpfQoudGVhbXN7ZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O2ZvbnQtd2VpZ2h0Ojc1MDtmb250LXNpemU6MTlweDttYXJnaW46MTJweCAwfS50ZWFte2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDttaW4td2lkdGg6MH0udGVhbSBpbWd7d2lkdGg6MzRweDtoZWlnaHQ6MzRweDtvYmplY3QtZml0OmNvbnRhaW59LnRlYW0gc3BhbntvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpc30KLmdyaWR7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoMywxZnIpO2dhcDo4cHh9LnB7YmFja2dyb3VuZDp2YXIoLS1zb2Z0KTtib3JkZXItcmFkaXVzOjEycHg7cGFkZGluZzoxMHB4O3RleHQtYWxpZ246Y2VudGVyfS5iZXN0e291dGxpbmU6MnB4IHNvbGlkIHZhcigtLWFjY2VudCl9Ci5tZXRyaWNze2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6cmVwZWF0KDIsbWlubWF4KDAsMWZyKSk7Z2FwOjhweDttYXJnaW4tdG9wOjEwcHh9Lm1ldHJpY3tiYWNrZ3JvdW5kOiMwZDE5MmI7Ym9yZGVyLXJhZGl1czoxMnB4O3BhZGRpbmc6MTBweH0ubWV0cmljIGJ7ZGlzcGxheTpibG9jaztmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1tdXRlZCk7bWFyZ2luLWJvdHRvbTozcHh9Ci5yb3d7bWFyZ2luLXRvcDoxMnB4O2xpbmUtaGVpZ2h0OjEuNTV9LnRhZ3tkaXNwbGF5OmlubGluZS1ibG9jaztiYWNrZ3JvdW5kOnZhcigtLXNvZnQpO3BhZGRpbmc6NnB4IDlweDtib3JkZXItcmFkaXVzOjlweDttYXJnaW46M3B4IDRweCAzcHggMH0KLnNtYWxse2ZvbnQtc2l6ZToxM3B4O21hcmdpbi10b3A6OXB4fS5ub3RpY2V7Zm9udC1zaXplOjEzcHg7Y29sb3I6I2M1ZDRlODttYXJnaW4tdG9wOjEwcHg7cGFkZGluZzo5cHggMTBweDtiYWNrZ3JvdW5kOnZhcigtLXNvZnQpO2JvcmRlci1yYWRpdXM6MTBweH0KLmRldGFpbGJ0bnttYXJnaW4tdG9wOjE0cHg7YmFja2dyb3VuZDojMjAzNjUzO2NvbG9yOiNkOWVjZmY7d2lkdGg6MTAwJX0uZGV0YWlsc3ttYXJnaW4tdG9wOjEycHg7cGFkZGluZzoxMnB4O2JhY2tncm91bmQ6IzBkMTkyYjtib3JkZXItcmFkaXVzOjEycHh9Ci5zZWN0aW9ue21hcmdpbi10b3A6MTJweH0uc2VjdGlvbj5ie2Rpc3BsYXk6YmxvY2s7bWFyZ2luLWJvdHRvbTo2cHh9LnBsYXllcmxpbmV7cGFkZGluZzo0cHggMDtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjMjAzMDRhfQoub2Rkc2dyaWR7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoMywxZnIpO2dhcDo3cHh9Lm9kZHtiYWNrZ3JvdW5kOnZhcigtLXNvZnQpO2JvcmRlci1yYWRpdXM6MTBweDtwYWRkaW5nOjhweDt0ZXh0LWFsaWduOmNlbnRlcn0KLnZhbHVlYm94e21hcmdpbi10b3A6MTBweDtiYWNrZ3JvdW5kOnZhcigtLXNvZnQpO2JvcmRlci1yYWRpdXM6MTJweDtwYWRkaW5nOjEwcHh9LnZhbHVlcm93e2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MzZweCAxZnIgMWZyIDFmcjtnYXA6NnB4O3BhZGRpbmc6NnB4IDA7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgIzI1Mzc1Mjtmb250LXNpemU6MTNweH0udmFsdWVyb3c6bGFzdC1jaGlsZHtib3JkZXItYm90dG9tOjB9LnBvc2l0aXZle2ZvbnQtd2VpZ2h0Ojc1MDtjb2xvcjp2YXIoLS1nb29kKX0ud2FybmluZ3tmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1tdXRlZCk7bWFyZ2luLXRvcDo4cHh9Ci5iYWRnZXtkaXNwbGF5OmlubGluZS1ibG9jaztmb250LXNpemU6MTJweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWxpbmUpO2JvcmRlci1yYWRpdXM6OTk5cHg7cGFkZGluZzo0cHggOHB4O21hcmdpbjowIDVweCA1cHggMH0ucXVhbGl0eS1nb29ke2NvbG9yOnZhcigtLWdvb2QpfS5xdWFsaXR5LXdhcm57Y29sb3I6dmFyKC0td2Fybil9CkBtZWRpYShtYXgtd2lkdGg6NjAwcHgpe21haW57cGFkZGluZy10b3A6MjRweH1oMXtmb250LXNpemU6MzRweH0udGVhbXN7Zm9udC1zaXplOjE2cHh9LnRlYW0gaW1ne3dpZHRoOjMwcHg7aGVpZ2h0OjMwcHh9Lm1ldHJpY3N7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmcn0udmFsdWVyb3d7Zm9udC1zaXplOjEycHh9fQo8L3N0eWxlPgo8L2hlYWQ+Cjxib2R5PjxtYWluPgo8ZGl2IGlkPSJhcGktcmVtYWluaW5nIiBjbGFzcz0ibXV0ZWQiPjwvZGl2Pgo8aDE+Q2FsY2lvIEFJIDEuMjwvaDE+CjxwIGNsYXNzPSJzdWIiPkRhdGkgcmVhbGkg4oaSIEFuYWxpc2kg4oaSIFByZXZpc2lvbmkg4oCiIEVsbyBzZXBhcmF0byBkYWxsYSBmb3J6YSBzdHJ1dHR1cmFsZSDigKIgSDJIIOKAoiBWQUxVRTwvcD4KCjxkaXYgY2xhc3M9ImNvbnRyb2xzIj4KPHNlbGVjdCBpZD0ibGVhZ3VlIj4KPG9wdGlvbiB2YWx1ZT0iMTM1Ij7wn4eu8J+HuSBTZXJpZSBBPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT0iMTM2Ij7wn4eu8J+HuSBTZXJpZSBCPC9vcHRpb24+CjxvcHRpb24gdmFsdWU9IjM5Ij7wn4es8J+HpyBQcmVtaWVyIExlYWd1ZTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9IjE0MCI+8J+HqvCfh7ggTGEgTGlnYTwvb3B0aW9uPgo8b3B0aW9uIHZhbHVlPSI3OCI+8J+HqfCfh6ogQnVuZGVzbGlnYTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9IjYxIj7wn4er8J+HtyBMaWd1ZSAxPC9vcHRpb24+CjxvcHRpb24gdmFsdWU9Ijg4Ij7wn4ez8J+HsSBFcmVkaXZpc2llPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT0iOTQiPvCfh7Xwn4e5IFByaW1laXJhIExpZ2E8L29wdGlvbj4KPG9wdGlvbiB2YWx1ZT0iMiI+8J+HqvCfh7ogQ2hhbXBpb25zIExlYWd1ZTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9IjMiPvCfh6rwn4e6IEV1cm9wYSBMZWFndWU8L29wdGlvbj4KPC9zZWxlY3Q+CjxidXR0b24gaWQ9InJlZnJlc2giIG9uY2xpY2s9ImxvYWQodHJ1ZSkiPkFnZ2lvcm5hPC9idXR0b24+CjwvZGl2PgoKPGRpdiBjbGFzcz0ic21hbGwiPkNhY2hlIGxvY2FsZSAzMCBtaW51dGkgKyBjYWNoZSBDbG91ZGZsYXJlLiBJIGRldHRhZ2xpIChxdW90ZSwgYXNzZW50aSwgZm9ybWF6aW9uaSkgdmVuZ29ubyBjYXJpY2F0aSBzb2xvIHF1YW5kbyBhcHJpIHVuYSBwYXJ0aXRhLCBwZXIgcmlkdXJyZSBsZSBjaGlhbWF0ZSBBUEkuPC9kaXY+CjxkaXYgY2xhc3M9Im5vdGljZSI+PGI+TW9kZWxsbyAxLjI8L2I+PGJyPlRyZSBsaXZlbGxpIGRpc3RpbnRpOiA8Yj5EYXRpIHJlYWxpPC9iPiwgPGI+QW5hbGlzaSBkZWwgbW9kZWxsbzwvYj4gZSA8Yj5QcmV2aXNpb25pPC9iPi4gRWxvIGRpbmFtaWNvIGUgZm9yemEgc3RydXR0dXJhbGUgc29ubyBtb3N0cmF0aSBzZXBhcmF0YW1lbnRlLiDigJx4RyBtb2RlbGxv4oCdIGluZGljYSBpIGdvbCBhdHRlc2kgc3RpbWF0aSBkYWwgbW9kZWxsbywgbm9uIGzigJl4RyB1ZmZpY2lhbGUgZGVsIHByb3ZpZGVyLjwvZGl2PgoKPGRpdiBpZD0ic3RhdHVzIj5DYXJpY2FtZW50b+KApjwvZGl2Pgo8ZGl2IGlkPSJtYXRjaGVzIj48L2Rpdj4KCjxzY3JpcHQ+CmNvbnN0IG1vZGVsQnlGaXh0dXJlPXt9Owpjb25zdCBlc2M9cz0+U3RyaW5nKHM/PycnKS5yZXBsYWNlKC9bJjw+IiddL2csbT0+KHsnJic6JyZhbXA7JywnPCc6JyZsdDsnLCc+JzonJmd0OycsJyInOicmcXVvdDsnLCInIjonJiMzOTsnfVttXSkpOwpjb25zdCBwY3Q9eD0+TnVtYmVyLmlzRmluaXRlKE51bWJlcih4KSk/KE51bWJlcih4KSoxMDApLnRvRml4ZWQoMSkrJyUnOifigJQnOwpjb25zdCBudW09KHgsZD0yKT0+TnVtYmVyLmlzRmluaXRlKE51bWJlcih4KSk/TnVtYmVyKHgpLnRvRml4ZWQoZCk6J+KAlCc7CmNvbnN0IENBQ0hFX1RUTD0zMCo2MCoxMDAwLCBERVRBSUxfVFRMPTMwKjYwKjEwMDA7CmNvbnN0IGtleUxlYWd1ZT1sPT4nY2FsY2lvYWlfdjEyXycrbCwga2V5RGV0YWlsPWlkPT4nY2FsY2lvYWlfdjEyX2RldGFpbF8nK2lkOwoKZnVuY3Rpb24gY2FjaGVSZWFkKGssdHRsKXt0cnl7Y29uc3QgeD1KU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGspfHwnbnVsbCcpO3JldHVybiB4JiZEYXRlLm5vdygpLXgudDx0dGw/eC5kOm51bGx9Y2F0Y2h7cmV0dXJuIG51bGx9fQpmdW5jdGlvbiBjYWNoZVdyaXRlKGssZCl7dHJ5e2xvY2FsU3RvcmFnZS5zZXRJdGVtKGssSlNPTi5zdHJpbmdpZnkoe3Q6RGF0ZS5ub3coKSxkfSkpfWNhdGNoe319Cgphc3luYyBmdW5jdGlvbiBsb2FkKGZvcmNlPWZhbHNlKXsKIGNvbnN0IGxlYWd1ZT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVhZ3VlJykudmFsdWUsc3Q9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3N0YXR1cycpLGJveD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbWF0Y2hlcycpLGJ0bj1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVmcmVzaCcpOwogYm94LmlubmVySFRNTD0nJzsKIGNvbnN0IGNhY2hlZD1jYWNoZVJlYWQoa2V5TGVhZ3VlKGxlYWd1ZSksQ0FDSEVfVFRMKTsKIGlmKGNhY2hlZCYmIWZvcmNlKXtyZW5kZXIoY2FjaGVkLHRydWUpO3JldHVybn0KIHN0LnRleHRDb250ZW50PSdBbmFsaXNpIGluIGNvcnNv4oCmJztidG4uZGlzYWJsZWQ9dHJ1ZTsKIHRyeXsKICAgY29uc3Qgcj1hd2FpdCBmZXRjaCgnL2FwaS9hbmFseXplP2xlYWd1ZT0nK2VuY29kZVVSSUNvbXBvbmVudChsZWFndWUpKycmdj0xMjAnKyhmb3JjZT8nJmZyZXNoPTEnOicnKSk7CiAgIGNvbnN0IGo9YXdhaXQgci5qc29uKCk7CiAgIGNvbnN0IHJlbT1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBpLXJlbWFpbmluZycpOwogICBpZihyZW0mJmoubWV0YT8ucmVxdWVzdHNSZW1haW5pbmchPW51bGwpcmVtLnRleHRDb250ZW50PWBBUEktRm9vdGJhbGw6ICR7ai5tZXRhLnJlcXVlc3RzUmVtYWluaW5nfSByaWNoaWVzdGUgcmltYXN0ZWA7CiAgIGlmKCFyLm9rfHwhai5vayl7c3QuaW5uZXJIVE1MPSc8Yj5FcnJvcmU8L2I+PGJyPicrZXNjKGoubWVzc2FnZXx8J0Vycm9yZSBzY29ub3NjaXV0bycpO3JldHVybn0KICAgY2FjaGVXcml0ZShrZXlMZWFndWUobGVhZ3VlKSxqKTtyZW5kZXIoaixmYWxzZSk7CiB9Y2F0Y2goeCl7c3QudGV4dENvbnRlbnQ9J0Vycm9yZTogJyt4Lm1lc3NhZ2V9CiBmaW5hbGx5e2J0bi5kaXNhYmxlZD1mYWxzZX0KfQoKZnVuY3Rpb24gcXVhbGl0eUNsYXNzKHEpe3JldHVybiAvYWx0YXxidW9uYS8udGVzdChxfHwnJyk/J3F1YWxpdHktZ29vZCc6L2Jhc3NhLy50ZXN0KHF8fCcnKT8ncXVhbGl0eS13YXJuJzonJ30KCmZ1bmN0aW9uIHJlbmRlcihqLGZyb21DYWNoZSl7CiBjb25zdCBzdD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc3RhdHVzJyksYm94PWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtYXRjaGVzJyk7Ym94LmlubmVySFRNTD0nJzsKIGNvbnN0IGNhbGxzPWoubWV0YT8uYXBpQ2FsbHM/PyfigJQnOwogc3QudGV4dENvbnRlbnQ9YCR7ai5tYXRjaGVzLmxlbmd0aH0gcGFydGl0ZSDigKIgJHtqLm1ldGEubGVhZ3VlTmFtZX0g4oCiICR7ZnJvbUNhY2hlPydjYWNoZSBsb2NhbGUnOidkYXRpIGFnZ2lvcm5hdGknfSDigKIgJHtjYWxsc30gY2hpYW1hdGUgQVBJIOKAoiBtb2RlbGxvICR7ai5tZXRhLnZlcnNpb259YDsKIGlmKCFqLm1hdGNoZXMubGVuZ3RoKXtib3guaW5uZXJIVE1MPSc8ZGl2IGNsYXNzPSJtYXRjaCI+TmVzc3VuYSBwYXJ0aXRhIG5laSBwcm9zc2ltaSAxNCBnaW9ybmkuPC9kaXY+JztyZXR1cm59CiBmb3IoY29uc3QgZyBvZiBqLm1hdGNoZXMpewogICBjb25zdCBhPWcuYW5hbHlzaXM7bW9kZWxCeUZpeHR1cmVbZy5pZF09YTsKICAgY29uc3QgZHQ9bmV3IERhdGUoZy5kYXRlKS50b0xvY2FsZVN0cmluZygnaXQtSVQnLHt3ZWVrZGF5OidzaG9ydCcsZGF5OicyLWRpZ2l0Jyxtb250aDonMi1kaWdpdCcsaG91cjonMi1kaWdpdCcsbWludXRlOicyLWRpZ2l0J30pOwogICBpZihhLmluc3VmZmljaWVudCl7CiAgICAgYm94Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJyxgPGRpdiBjbGFzcz0ibWF0Y2giPjxkaXYgY2xhc3M9Im1ldGEiPiR7ZXNjKGR0KX08L2Rpdj4KICAgICA8ZGl2IGNsYXNzPSJ0ZWFtcyI+PHNwYW4gY2xhc3M9InRlYW0iPjxpbWcgc3JjPSIke2VzYyhnLmhvbWUubG9nbyl9Ij48c3Bhbj4ke2VzYyhnLmhvbWUubmFtZSl9PC9zcGFuPjwvc3Bhbj48c3Bhbj7igJM8L3NwYW4+PHNwYW4gY2xhc3M9InRlYW0iPjxzcGFuPiR7ZXNjKGcuYXdheS5uYW1lKX08L3NwYW4+PGltZyBzcmM9IiR7ZXNjKGcuYXdheS5sb2dvKX0iPjwvc3Bhbj48L2Rpdj4KICAgICA8ZGl2IGNsYXNzPSJub3RpY2UiPjxiPkRhdGkgaW5zdWZmaWNpZW50aTwvYj48YnI+JHtlc2MoYS5yZWFzb258fCcnKX08L2Rpdj4KICAgICAke2EuZXhwbGFpbj9gPGRpdiBjbGFzcz0ibm90aWNlIj4ke2EuZXhwbGFpbi5tYXAodj0+J+KAoiAnK2VzYyh2KSkuam9pbignPGJyPicpfTwvZGl2PmA6Jyd9CiAgICAgPGJ1dHRvbiBjbGFzcz0iZGV0YWlsYnRuIiBvbmNsaWNrPSJsb2FkRGV0YWlscygke2cuaWR9LHRoaXMpIj5RdW90ZSDigKIgQXNzZW50aSDigKIgRm9ybWF6aW9uaTwvYnV0dG9uPjxkaXYgY2xhc3M9ImRldGFpbHMiIGlkPSJkZXRhaWxzLSR7Zy5pZH0iIHN0eWxlPSJkaXNwbGF5Om5vbmUiPjwvZGl2PjwvZGl2PmApOwogICAgIGNvbnRpbnVlOwogICB9CiAgIGNvbnN0IHZhbHM9W2EucDEsYS5weCxhLnAyXSxteD1NYXRoLm1heCguLi52YWxzKTsKICAgYm94Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJyxgPGRpdiBjbGFzcz0ibWF0Y2giPgogICAgPGRpdiBjbGFzcz0ibWV0YSI+JHtlc2MoZHQpfTwvZGl2PgogICAgPGRpdiBjbGFzcz0idGVhbXMiPjxzcGFuIGNsYXNzPSJ0ZWFtIj48aW1nIHNyYz0iJHtlc2MoZy5ob21lLmxvZ28pfSI+PHNwYW4+JHtlc2MoZy5ob21lLm5hbWUpfTwvc3Bhbj48L3NwYW4+PHNwYW4+4oCTPC9zcGFuPjxzcGFuIGNsYXNzPSJ0ZWFtIj48c3Bhbj4ke2VzYyhnLmF3YXkubmFtZSl9PC9zcGFuPjxpbWcgc3JjPSIke2VzYyhnLmF3YXkubG9nbyl9Ij48L3NwYW4+PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJncmlkIj48ZGl2IGNsYXNzPSJwICR7YS5wMT09PW14PydiZXN0JzonJ30iPjxiPjE8L2I+PGJyPiR7cGN0KGEucDEpfTwvZGl2PjxkaXYgY2xhc3M9InAgJHthLnB4PT09bXg/J2Jlc3QnOicnfSI+PGI+WDwvYj48YnI+JHtwY3QoYS5weCl9PC9kaXY+PGRpdiBjbGFzcz0icCAke2EucDI9PT1teD8nYmVzdCc6Jyd9Ij48Yj4yPC9iPjxicj4ke3BjdChhLnAyKX08L2Rpdj48L2Rpdj4KICAgIDxkaXYgY2xhc3M9InJvdyI+PGI+REFUSSBSRUFMSTwvYj48L2Rpdj4KICAgIDxkaXYgY2xhc3M9Im1ldHJpY3MiPgogICAgICA8ZGl2IGNsYXNzPSJtZXRyaWMiPjxiPkdPTCBGQVRUSSAvIEdBUkE8L2I+JHtudW0oYS5vYnNlcnZlZD8uaG9tZT8uZ2ZQZXJNYXRjaCl9IOKAkyAke251bShhLm9ic2VydmVkPy5hd2F5Py5nZlBlck1hdGNoKX08L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj48Yj5HT0wgU1VCSVRJIC8gR0FSQTwvYj4ke251bShhLm9ic2VydmVkPy5ob21lPy5nYVBlck1hdGNoKX0g4oCTICR7bnVtKGEub2JzZXJ2ZWQ/LmF3YXk/LmdhUGVyTWF0Y2gpfTwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJtZXRyaWMiPjxiPkNBU0EgLyBUUkFTRkVSVEEgR0Y8L2I+JHtudW0oYS5vYnNlcnZlZD8uaG9tZT8udmVudWVHRil9IOKAkyAke251bShhLm9ic2VydmVkPy5hd2F5Py52ZW51ZUdGKX08L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj48Yj5QUEcgU1RBR0lPTkU8L2I+JHtudW0oYS5vYnNlcnZlZD8uaG9tZT8ucHBnKX0g4oCTICR7bnVtKGEub2JzZXJ2ZWQ/LmF3YXk/LnBwZyl9PC9kaXY+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9InJvdyI+PGI+QU5BTElTSSBERUwgTU9ERUxMTzwvYj48L2Rpdj4KICAgIDxkaXYgY2xhc3M9Im1ldHJpY3MiPgogICAgICA8ZGl2IGNsYXNzPSJtZXRyaWMiPjxiPkVMTyBESU5BTUlDTzwvYj4ke2EuaG9tZUVsbz8/J+KAlCd9IOKAkyAke2EuYXdheUVsbz8/J+KAlCd9PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9Im1ldHJpYyI+PGI+Rk9SWkEgU1RSVVRUVVJBTEU8L2I+JHtudW0oYS5ob21lU3RydWN0dXJhbCl9IOKAkyAke251bShhLmF3YXlTdHJ1Y3R1cmFsKX08L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj48Yj5GT1JNQSBQRVNBVEE8L2I+JHtudW0oYS5ob21lRm9ybSwyKX0g4oCTICR7bnVtKGEuYXdheUZvcm0sMil9PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9Im1ldHJpYyI+PGI+UklQT1NPPC9iPiR7YS5ob21lUmVzdD8/J+KAlCd9ZyDigJMgJHthLmF3YXlSZXN0Pz8n4oCUJ31nPC9kaXY+CiAgICA8L2Rpdj4KICAgICR7YS5oMmg/YDxkaXYgY2xhc3M9InJvdyI+PGI+U0NPTlRSSSBESVJFVFRJIChtYXggNSk8L2I+IDxzcGFuIGNsYXNzPSJ0YWciPiR7ZXNjKGcuaG9tZS5uYW1lKX0gJHthLmgyaC5ob21lV2luc308L3NwYW4+PHNwYW4gY2xhc3M9InRhZyI+WCAke2EuaDJoLmRyYXdzfTwvc3Bhbj48c3BhbiBjbGFzcz0idGFnIj4ke2VzYyhnLmF3YXkubmFtZSl9ICR7YS5oMmguYXdheVdpbnN9PC9zcGFuPjxzcGFuIGNsYXNzPSJ0YWciPkdvbCAke2EuaDJoLmhvbWVHb2Fsc30tJHthLmgyaC5hd2F5R29hbHN9PC9zcGFuPjwvZGl2PmA6Jyd9CiAgICA8ZGl2IGNsYXNzPSJyb3ciPjxiPlBSRVZJU0lPTkkgQUk8L2I+PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJtZXRyaWNzIj48ZGl2IGNsYXNzPSJtZXRyaWMiPjxiPnhHIE1PREVMTE88L2I+JHtudW0oYS5saCl9IOKAkyAke251bShhLmxhKX08L2Rpdj48ZGl2IGNsYXNzPSJtZXRyaWMiPjxiPlBPV0VSIEZJTkFMRSBERUwgTUFUQ0g8L2I+JHtudW0oYS5ob21lUG93ZXIpfSDigJMgJHtudW0oYS5hd2F5UG93ZXIpfTwvZGl2PjwvZGl2PgogICAgPGRpdiBjbGFzcz0icm93Ij48c3BhbiBjbGFzcz0iYmFkZ2UgJHtxdWFsaXR5Q2xhc3MoYS5jb25maWRlbmNlKX0iPkFmZmlkYWJpbGl0w6AgJHtlc2MoYS5jb25maWRlbmNlKX08L3NwYW4+JHthLnNhbXBsZSE9bnVsbD9gPHNwYW4gY2xhc3M9ImJhZGdlIj5jYW1waW9uZSAke2Euc2FtcGxlfTwvc3Bhbj5gOicnfTwvZGl2PgogICAgPGRpdiBjbGFzcz0icm93Ij48Yj5SaXN1bHRhdGkgZXNhdHRpOjwvYj4gJHsoYS5zY29yZXN8fFtdKS5tYXAoeD0+YDxzcGFuIGNsYXNzPSJ0YWciPiR7ZXNjKHguc2NvcmUpfSAke3BjdCh4LnApfTwvc3Bhbj5gKS5qb2luKCcnKX08L2Rpdj4KICAgIDxkaXYgY2xhc3M9InJvdyI+PGI+R29sOjwvYj48c3BhbiBjbGFzcz0idGFnIj5PMS41ICR7cGN0KGEub3ZlcjE1KX08L3NwYW4+PHNwYW4gY2xhc3M9InRhZyI+VTEuNSAke3BjdChhLnVuZGVyMTUpfTwvc3Bhbj48c3BhbiBjbGFzcz0idGFnIj5PMi41ICR7cGN0KGEub3Zlcil9PC9zcGFuPjxzcGFuIGNsYXNzPSJ0YWciPlUyLjUgJHtwY3QoYS51bmRlcil9PC9zcGFuPjxzcGFuIGNsYXNzPSJ0YWciPk8zLjUgJHtwY3QoYS5vdmVyMzUpfTwvc3Bhbj48c3BhbiBjbGFzcz0idGFnIj5VMy41ICR7cGN0KGEudW5kZXIzNSl9PC9zcGFuPjwvZGl2PgogICAgPGRpdiBjbGFzcz0icm93Ij48Yj5Hb2FsL05vIEdvYWw6PC9iPiA8c3BhbiBjbGFzcz0idGFnIj5Hb2FsICR7cGN0KGEuYnR0cyl9PC9zcGFuPjxzcGFuIGNsYXNzPSJ0YWciPk5vIEdvYWwgJHtwY3QoYS5ub0J0dHMpfTwvc3Bhbj48L2Rpdj4KICAgIDxkaXYgY2xhc3M9InJvdyI+PGI+RG9wcGlhIGNoYW5jZTo8L2I+IDxzcGFuIGNsYXNzPSJ0YWciPjFYICR7cGN0KGEuZGMxeCl9PC9zcGFuPjxzcGFuIGNsYXNzPSJ0YWciPjEyICR7cGN0KGEuZGMxMil9PC9zcGFuPjxzcGFuIGNsYXNzPSJ0YWciPlgyICR7cGN0KGEuZGN4Mil9PC9zcGFuPjwvZGl2PgogICAgPGRpdiBjbGFzcz0icm93Ij48Yj5EcmF3IE5vIEJldDo8L2I+IDxzcGFuIGNsYXNzPSJ0YWciPkNhc2EgJHtwY3QoYS5kbmIxKX08L3NwYW4+PHNwYW4gY2xhc3M9InRhZyI+T3NwaXRlICR7cGN0KGEuZG5iMil9PC9zcGFuPjwvZGl2PgogICAgPGRpdiBjbGFzcz0ic21hbGwiPiR7ZXNjKGEubWV0aG9kfHwnJyl9PC9kaXY+CiAgICAke2Eubm90ZT9gPGRpdiBjbGFzcz0ibm90aWNlIj4ke2VzYyhhLm5vdGUpfTwvZGl2PmA6Jyd9CiAgICAke2EuZXhwbGFpbj8ubGVuZ3RoP2A8ZGl2IGNsYXNzPSJub3RpY2UiPjxiPlBlcmNow6kgaWwgbW9kZWxsbyBkaWNlIHF1ZXN0bzwvYj48YnI+JHthLmV4cGxhaW4ubWFwKHY9PifigKIgJytlc2ModikpLmpvaW4oJzxicj4nKX08L2Rpdj5gOicnfQogICAgPGJ1dHRvbiBjbGFzcz0iZGV0YWlsYnRuIiBvbmNsaWNrPSJsb2FkRGV0YWlscygke2cuaWR9LHRoaXMpIj5RdW90ZSDigKIgQXNzZW50aSDigKIgRm9ybWF6aW9uaSDigKIgVkFMVUU8L2J1dHRvbj48ZGl2IGNsYXNzPSJkZXRhaWxzIiBpZD0iZGV0YWlscy0ke2cuaWR9IiBzdHlsZT0iZGlzcGxheTpub25lIj48L2Rpdj4KICAgPC9kaXY+YCk7CiB9Cn0KCmFzeW5jIGZ1bmN0aW9uIGxvYWREZXRhaWxzKGlkLGJ0bil7CiBjb25zdCBwYW5lbD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGV0YWlscy0nK2lkKTsKIGlmKHBhbmVsLnN0eWxlLmRpc3BsYXk9PT0nYmxvY2snKXtwYW5lbC5zdHlsZS5kaXNwbGF5PSdub25lJztyZXR1cm59CiBwYW5lbC5zdHlsZS5kaXNwbGF5PSdibG9jayc7CiBjb25zdCBjYWNoZWQ9Y2FjaGVSZWFkKGtleURldGFpbChpZCksREVUQUlMX1RUTCk7aWYoY2FjaGVkKXtyZW5kZXJEZXRhaWxzKHBhbmVsLGNhY2hlZCx0cnVlKTtyZXR1cm59CiBwYW5lbC5pbm5lckhUTUw9JzxzcGFuIGNsYXNzPSJtdXRlZCI+Q2FyaWNhbWVudG8gZGV0dGFnbGnigKY8L3NwYW4+JztidG4uZGlzYWJsZWQ9dHJ1ZTsKIHRyeXsKICAgY29uc3Qgcj1hd2FpdCBmZXRjaCgnL2FwaS9kZXRhaWxzP2ZpeHR1cmU9JytlbmNvZGVVUklDb21wb25lbnQoaWQpKTsKICAgY29uc3Qgaj1hd2FpdCByLmpzb24oKTsKICAgaWYoIXIub2t8fCFqLm9rKXtwYW5lbC5pbm5lckhUTUw9JzxiPkRldHRhZ2xpIG5vbiBkaXNwb25pYmlsaTwvYj48YnI+PHNwYW4gY2xhc3M9Im11dGVkIj4nK2VzYyhqLm1lc3NhZ2V8fCcnKSsnPC9zcGFuPic7cmV0dXJufQogICBjYWNoZVdyaXRlKGtleURldGFpbChpZCksaik7cmVuZGVyRGV0YWlscyhwYW5lbCxqLGZhbHNlKTsKIH1jYXRjaCh4KXtwYW5lbC5pbm5lckhUTUw9JzxiPkVycm9yZTwvYj48YnI+PHNwYW4gY2xhc3M9Im11dGVkIj4nK2VzYyh4Lm1lc3NhZ2UpKyc8L3NwYW4+J30KIGZpbmFsbHl7YnRuLmRpc2FibGVkPWZhbHNlfQp9CgpmdW5jdGlvbiByZW5kZXJEZXRhaWxzKHBhbmVsLGosY2FjaGUpewogY29uc3Qgbz1qLm9kZHN8fHt9LGluaj1qLmluanVyaWVzfHxbXSxsdT1qLmxpbmV1cHN8fFtdOwogbGV0IG9kZHNIdG1sPSc8c3BhbiBjbGFzcz0ibXV0ZWQiPlF1b3RlIDFYMiBub24gZGlzcG9uaWJpbGkuPC9zcGFuPic7CiBpZihvLmhvbWV8fG8uZHJhd3x8by5hd2F5KW9kZHNIdG1sPWA8ZGl2IGNsYXNzPSJvZGRzZ3JpZCI+PGRpdiBjbGFzcz0ib2RkIj48Yj4xPC9iPjxicj4ke2VzYyhvLmhvbWV8fCfigJQnKX08L2Rpdj48ZGl2IGNsYXNzPSJvZGQiPjxiPlg8L2I+PGJyPiR7ZXNjKG8uZHJhd3x8J+KAlCcpfTwvZGl2PjxkaXYgY2xhc3M9Im9kZCI+PGI+MjwvYj48YnI+JHtlc2Moby5hd2F5fHwn4oCUJyl9PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz0ibXV0ZWQiPiR7ZXNjKG8uYm9va21ha2VyfHwnQm9va21ha2VyJyl9ICR7by51cGRhdGVkPyfigKIgJytlc2Moby51cGRhdGVkKTonJ308L2Rpdj5gOwogY29uc3QgaW5qdXJpZXNIdG1sPWluai5sZW5ndGg/aW5qLnNsaWNlKDAsMjApLm1hcCh4PT5gPGRpdiBjbGFzcz0icGxheWVybGluZSI+JHtlc2MoeC50ZWFtKX0g4oCUIDxiPiR7ZXNjKHgucGxheWVyKX08L2I+IDxzcGFuIGNsYXNzPSJtdXRlZCI+JHtlc2MoeC5yZWFzb258fCdhc3NlbnRlL2R1YmJpbycpfTwvc3Bhbj48L2Rpdj5gKS5qb2luKCcnKTonPHNwYW4gY2xhc3M9Im11dGVkIj5OZXNzdW5hIGluZm9ybWF6aW9uZSBzdSBhc3NlbnRpL2luZm9ydHVuYXRpIGRpc3BvbmliaWxlLjwvc3Bhbj4nOwogY29uc3QgbGluZXVwc0h0bWw9bHUubGVuZ3RoP2x1Lm1hcCh0PT5gPGRpdiBjbGFzcz0ic2VjdGlvbiI+PGI+JHtlc2ModC50ZWFtKX0gJHt0LmZvcm1hdGlvbj8nKCcrZXNjKHQuZm9ybWF0aW9uKSsnKSc6Jyd9PC9iPiR7KHQuc3RhcnRYSXx8W10pLnNsaWNlKDAsMTEpLm1hcChwPT5gPGRpdiBjbGFzcz0icGxheWVybGluZSI+JHtlc2MocCl9PC9kaXY+YCkuam9pbignJyl9PC9kaXY+YCkuam9pbignJyk6JzxzcGFuIGNsYXNzPSJtdXRlZCI+Rm9ybWF6aW9uaSB1ZmZpY2lhbGkgbm9uIGFuY29yYSBkaXNwb25pYmlsaS48L3NwYW4+JzsKIGNvbnN0IG09bW9kZWxCeUZpeHR1cmVbai5maXh0dXJlXTtsZXQgdmFsdWVIdG1sPSc8c3BhbiBjbGFzcz0ibXV0ZWQiPlZBTFVFIG5vbiBjYWxjb2xhYmlsZS48L3NwYW4+JzsKIGlmKG0mJiFtLmluc3VmZmljaWVudCYmby5ob21lJiZvLmRyYXcmJm8uYXdheSl7CiAgIGNvbnN0IG9kZHM9WytvLmhvbWUsK28uZHJhdywrby5hd2F5XSxwcm9icz1bbS5wMSxtLnB4LG0ucDJdOwogICBpZihvZGRzLmV2ZXJ5KHg9Png+MSkmJnByb2JzLmV2ZXJ5KHg9Png+MCkpewogICAgIGNvbnN0IHJhdz1vZGRzLm1hcCh4PT4xL3gpLHN1bT1yYXcucmVkdWNlKChhLGIpPT5hK2IsMCksbWFya2V0PXJhdy5tYXAoeD0+eC9zdW0pLGxhYmVscz1bJzEnLCdYJywnMiddOwogICAgIHZhbHVlSHRtbD0nPGRpdiBjbGFzcz0idmFsdWVib3giPicrbGFiZWxzLm1hcCgobGFiLGkpPT57CiAgICAgICBjb25zdCBlZGdlPShwcm9ic1tpXS1tYXJrZXRbaV0pKjEwMCxldj0ocHJvYnNbaV0qb2Rkc1tpXS0xKSoxMDA7CiAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9InZhbHVlcm93ICR7ZXY+PTU/J3Bvc2l0aXZlJzonJ30iPjxkaXY+PGI+JHtsYWJ9PC9iPjwvZGl2PjxkaXY+TW9kLiAkeyhwcm9ic1tpXSoxMDApLnRvRml4ZWQoMSl9JTwvZGl2PjxkaXY+TWVyYy4gJHsobWFya2V0W2ldKjEwMCkudG9GaXhlZCgxKX0lPC9kaXY+PGRpdj5FViAke2V2Pj0wPycrJzonJ30ke2V2LnRvRml4ZWQoMSl9JTwvZGl2PjwvZGl2PmA7CiAgICAgfSkuam9pbignJykrJzwvZGl2PjxkaXYgY2xhc3M9Indhcm5pbmciPlZBTFVFID0gY29uZnJvbnRvIHByb2JhYmlsaXN0aWNvLCBub24gZXNpdG8gY2VydG8gbsOpIGNvbnNpZ2xpbyBkaSBwdW50YXRhLjwvZGl2Pic7CiAgIH0KIH0KIHBhbmVsLmlubmVySFRNTD1gPGRpdiBjbGFzcz0ibXV0ZWQiPiR7Y2FjaGU/J0RhdGkgZGFsbGEgY2FjaGUgbG9jYWxlJzonRGF0aSBhZ2dpb3JuYXRpJ30g4oCiICR7ai5hcGlDYWxscz8/J+KAlCd9IGNoaWFtYXRlIEFQSSR7ai5yZXF1ZXN0c1JlbWFpbmluZyE9bnVsbD8nIOKAoiAnK2oucmVxdWVzdHNSZW1haW5pbmcrJyByaW1hc3RlJzonJ308L2Rpdj4KIDxkaXYgY2xhc3M9InNlY3Rpb24iPjxiPlF1b3RlIGJvb2ttYWtlcjwvYj4ke29kZHNIdG1sfTwvZGl2PgogPGRpdiBjbGFzcz0ic2VjdGlvbiI+PGI+Q29uZnJvbnRvIG1vZGVsbG8g4oaUIG1lcmNhdG88L2I+JHt2YWx1ZUh0bWx9PC9kaXY+CiA8ZGl2IGNsYXNzPSJzZWN0aW9uIj48Yj5Bc3NlbnRpIC8gaW5mb3J0dW5pPC9iPiR7aW5qdXJpZXNIdG1sfTwvZGl2PgogPGRpdiBjbGFzcz0ic2VjdGlvbiI+PGI+Rm9ybWF6aW9uaSB1ZmZpY2lhbGk8L2I+JHtsaW5ldXBzSHRtbH08L2Rpdj5gOwp9Cgpkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVhZ3VlJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywoKT0+bG9hZChmYWxzZSkpOwpsb2FkKGZhbHNlKTsKPC9zY3JpcHQ+CjwvbWFpbj48L2JvZHk+PC9odG1sPg==";

const API = "https://v3.football.api-sports.io";
const LEAGUES = {
  "135":{name:"Serie A",type:"domestic"}, "136":{name:"Serie B",type:"domestic"},
  "39":{name:"Premier League",type:"domestic"}, "140":{name:"La Liga",type:"domestic"},
  "78":{name:"Bundesliga",type:"domestic"}, "61":{name:"Ligue 1",type:"domestic"},
  "88":{name:"Eredivisie",type:"domestic"}, "94":{name:"Primeira Liga",type:"domestic"},
  "2":{name:"Champions League",type:"europe"}, "3":{name:"Europa League",type:"europe"}
};
const COUNTRY_LEAGUE = {
  "England":39,"Spain":140,"Germany":78,"France":61,"Italy":135,"Netherlands":88,"Portugal":94,
  "Belgium":144,"Scotland":179,"Austria":218,"Switzerland":207,"Turkey":203,"Greece":197,
  "Denmark":119,"Norway":103,"Sweden":113,"Poland":106,"Czech-Republic":345,"Czech Republic":345,
  "Croatia":210,"Serbia":286,"Ukraine":333,"Romania":283,"Hungary":271,"Slovakia":332,
  "Slovenia":373,"Cyprus":318,"Israel":383,"Azerbaijan":419
};
const LEAGUE_STRENGTH = {
  39:1.10,140:1.07,135:1.06,78:1.05,61:1.03,94:.99,88:.98,203:.97,144:.95,333:.95,
  218:.93,345:.93,207:.93,103:.92,197:.92,179:.94,119:.93,106:.92,332:.90,286:.90,
  210:.92,283:.89,271:.89,373:.88,318:.88,383:.90,113:.92,419:.88,136:.94
};
const TEAM_DOMESTIC_LEAGUE = {
  505:135,489:135,492:135,497:135,496:135,487:135,499:135,502:135,494:135,503:135,
  541:140,529:140,530:140,536:140,532:140,548:140,727:140,531:140,
  33:39,40:39,42:39,47:39,49:39,50:39,51:39,52:39,34:39,39:39,66:39,
  157:78,165:78,168:78,172:78,173:78,169:78,161:78,
  85:61,81:61,80:61,91:61,84:61,79:61,194:88,197:88,209:88,201:88,
  211:94,212:94,224:94,569:144,554:144,555:144,740:144,
  1853:197,1854:197,1855:197,1863:197,571:218,586:218,585:218,591:218,
  328:103,331:103,329:103,332:103,400:119,396:119,393:119,
  2032:207,2036:207,2037:207,247:179,248:179,645:203,611:203,549:203,
  556:345,5550:345,620:210,598:286,550:333,2285:333,347:106
};
const LEAGUE_NAMES = {39:"Premier League",140:"La Liga",135:"Serie A",136:"Serie B",78:"Bundesliga",61:"Ligue 1",94:"Primeira Liga",88:"Eredivisie",144:"Jupiler Pro League",179:"Scottish Premiership",218:"Austrian Bundesliga",207:"Swiss Super League",203:"Süper Lig",197:"Super League Greece",119:"Danish Superliga",103:"Eliteserien",113:"Allsvenskan",106:"Ekstraklasa",345:"Czech Liga",210:"HNL",286:"Serbian SuperLiga",333:"Ukrainian Premier League",283:"Romanian Liga I",271:"Hungarian NB I",332:"Slovak Super Liga",373:"Slovenian PrvaLiga",318:"Cypriot First Division",383:"Israeli Premier League",419:"Azerbaijan Premier League"};

let lastRequestsRemaining = null;

// Shared throttle + upstream cache. API-Football free plans have a strict per-minute
// request ceiling; keeping every upstream call serialized avoids burst failures.
const API_THROTTLE = (() => {
  const MIN_GAP_MS = 6500; // <= ~9 requests/minute, leaving safety margin below 10/min
  let queue = Promise.resolve();
  let lastStart = 0;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  return async task => {
    const run = async () => {
      const wait = Math.max(0, MIN_GAP_MS - (Date.now() - lastStart));
      if(wait) await sleep(wait);
      lastStart = Date.now();
      return task();
    };
    const p = queue.then(run, run);
    queue = p.catch(()=>{});
    return p;
  };
})();

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const blend=(a,b,w)=>a*(1-w)+b*w;
const finished=a=>(a||[]).filter(x=>["FT","AET","PEN"].includes(x.fixture?.status?.short)&&x.goals?.home!=null&&x.goals?.away!=null);
const pending=x=>!["FT","AET","PEN","CANC","PST"].includes(x.fixture?.status?.short);
const pack=(x,analysis)=>({id:x.fixture.id,date:x.fixture.date,home:x.teams.home,away:x.teams.away,analysis});

function upstreamTTL(path){
  if(path.startsWith("/odds?")) return 900;
  if(path.startsWith("/injuries?")||path.startsWith("/fixtures/lineups?")) return 600;
  if(path.startsWith("/teams?")||path.startsWith("/leagues?")) return 86400;
  return 21600;
}
function isRateLimitError(errors){
  const text=typeof errors==="string"?errors:JSON.stringify(errors||{});
  return /rate.?limit|too many requests|requests per minute/i.test(text);
}
async function api(path,key){
  const cache=caches.default;
  const cacheKey=new Request("https://api-cache.calcio-ai.local"+path,{method:"GET"});
  const cached=await cache.match(cacheKey);
  if(cached){
    try{return {ok:true,status:200,data:await cached.json(),cached:true}}catch{}
  }

  const execute=async()=>{
    const r=await fetch(API+path,{headers:{"x-apisports-key":key}});
    const rem=r.headers.get("x-ratelimit-requests-remaining");
    if(rem!=null&&rem!=="") lastRequestsRemaining=Number(rem);
    let data; try{data=await r.json()}catch{return {ok:false,status:r.status,errors:"JSON non valido"}}
    const has=data.errors&&(Array.isArray(data.errors)?data.errors.length:Object.keys(data.errors).length);
    return (!r.ok||has)?{ok:false,status:r.status,errors:data.errors,data}:{ok:true,status:r.status,data};
  };

  let result=await API_THROTTLE(execute);
  // One controlled retry after a rate-limit response. Because the global queue is
  // spaced, the retry lands in a later request slot instead of creating a burst.
  if(!result.ok&&isRateLimitError(result.errors)) result=await API_THROTTLE(execute);

  if(result.ok){
    const ttl=upstreamTTL(path);
    const resp=new Response(JSON.stringify(result.data),{headers:{"content-type":"application/json","Cache-Control":`public, max-age=${ttl}`}});
    try{await cache.put(cacheKey,resp)}catch{}
  }
  return result;
}
function apiError(x,where=""){
  const e=x?.errors; let detail="";
  if(Array.isArray(e)) detail=e.map(v=>typeof v==="string"?v:JSON.stringify(v)).join("; ");
  else if(e&&typeof e==="object") detail=Object.entries(e).map(([k,v])=>`${k}: ${typeof v==="string"?v:JSON.stringify(v)}`).join("; ");
  else if(typeof e==="string") detail=e;
  return `API-Football${where?" "+where:""}: HTTP ${x?.status||"?"}${detail?" — "+detail:""}`;
}
function avg(fs){
  if(!fs.length)return {home:1.45,away:1.20};
  let h=0,a=0; for(const f of fs){h+=Number(f.goals.home);a+=Number(f.goals.away)}
  return {home:h/fs.length,away:a/fs.length};
}
function teamStats(fs,id){
  const rows=fs.filter(f=>f.teams.home.id===id||f.teams.away.id===id); let gf=0,ga=0,pts=0;
  for(const f of rows){const home=f.teams.home.id===id,g=home?f.goals.home:f.goals.away,z=home?f.goals.away:f.goals.home;gf+=g;ga+=z;pts+=g>z?3:g===z?1:0}
  return {n:rows.length,gf,ga,pts};
}
function venueStats(fs,id,isHome){
  const rows=fs.filter(f=>(isHome?f.teams.home.id:f.teams.away.id)===id); let gf=0,ga=0;
  for(const f of rows){gf+=isHome?f.goals.home:f.goals.away;ga+=isHome?f.goals.away:f.goals.home}
  return {n:rows.length,gf,ga};
}
function leagueBase(fs){
  const m=new Map();
  for(const f of fs)for(const [id,gf,ga,pts] of [[f.teams.home.id,f.goals.home,f.goals.away,f.goals.home>f.goals.away?3:f.goals.home===f.goals.away?1:0],[f.teams.away.id,f.goals.away,f.goals.home,f.goals.away>f.goals.home?3:f.goals.away===f.goals.home?1:0]]){
    const t=m.get(id)||{n:0,gf:0,ga:0,pts:0};t.n++;t.gf+=gf;t.ga+=ga;t.pts+=pts;m.set(id,t);
  }
  const a=[...m.values()]; if(!a.length)return {ppg:1.35,gd:0};
  return {ppg:a.reduce((s,t)=>s+t.pts/t.n,0)/a.length,gd:a.reduce((s,t)=>s+(t.gf-t.ga)/t.n,0)/a.length};
}
function structuralPower(s,base){if(!s.n)return 1;return clamp(1+.17*((s.pts/s.n)-base.ppg)+.10*(((s.gf-s.ga)/s.n)-base.gd),.72,1.40)}
function currentWeight(n){if(n<=0)return 0;if(n<=3)return .08;if(n<=5)return .14;if(n<=8)return .24;if(n<=12)return .36;if(n<=16)return .48;return .62}
function venueFactor(cur,prev,avgCur,avgPrev,type){
  const raw=s=>!s.n?1:clamp(((type==="attack"?s.gf:s.ga)/s.n)/(avgCur||1),.80,1.20);
  const rawPrev=s=>!s.n?1:clamp(((type==="attack"?s.gf:s.ga)/s.n)/(avgPrev||1),.82,1.18);
  const w=Math.min(.35,cur.n/16); return clamp(blend(rawPrev(prev),raw(cur),w),.88,1.12);
}
function buildElo(fs,initial=1500){
  const elo=new Map(), games=new Map(); const rows=[...fs].sort((a,b)=>new Date(a.fixture.date)-new Date(b.fixture.date));
  const get=id=>elo.get(id)??initial;
  for(const f of rows){
    const h=f.teams.home.id,a=f.teams.away.id,rh=get(h),ra=get(a),homeAdv=55;
    const eh=1/(1+10**((ra-(rh+homeAdv))/400)); const hg=f.goals.home,ag=f.goals.away;
    const sh=hg>ag?1:hg===ag?.5:0; const margin=Math.abs(hg-ag); const mult=1+Math.min(1.2,margin*.15); const k=22*mult;
    elo.set(h,rh+k*(sh-eh)); elo.set(a,ra+k*((1-sh)-(1-eh)));
    games.set(h,(games.get(h)||0)+1); games.set(a,(games.get(a)||0)+1);
  }
  return {elo,games};
}
function eloPower(id,map){const r=map.elo.get(id)??1500;return clamp(10**((r-1500)/600),.72,1.40)}
function weightedForm(fs,id,eloMap){
  const a=fs.filter(f=>f.teams.home.id===id||f.teams.away.id===id).sort((x,y)=>new Date(y.fixture.date)-new Date(x.fixture.date)).slice(0,8);
  if(!a.length)return .5; let num=0,den=0;
  a.forEach((f,i)=>{const h=f.teams.home.id===id,g=h?f.goals.home:f.goals.away,z=h?f.goals.away:f.goals.home,opp=h?f.teams.away.id:f.teams.home.id;const pts=g>z?1:g===z?.5:0;const oppPower=eloPower(opp,eloMap);const rec=Math.max(.45,1-i*.08);const w=rec*clamp(oppPower,.80,1.20);num+=pts*w;den+=w});
  return den?num/den:.5;
}
function restDays(fs,id,date){
  const target=new Date(date).getTime(); const prev=fs.filter(f=>(f.teams.home.id===id||f.teams.away.id===id)&&new Date(f.fixture.date).getTime()<target).sort((a,b)=>new Date(b.fixture.date)-new Date(a.fixture.date))[0];
  if(!prev)return null; return Math.max(0,Math.round((target-new Date(prev.fixture.date).getTime())/864e5));
}
function restFactor(days){if(days==null)return 1;if(days<=2)return .94;if(days===3)return .97;if(days>=7)return 1.02;return 1}
function h2hStats(fs,homeId,awayId){
  const rows=(fs||[]).filter(f=>[homeId,awayId].includes(f.teams.home.id)&&[homeId,awayId].includes(f.teams.away.id)).sort((a,b)=>new Date(b.fixture.date)-new Date(a.fixture.date)).slice(0,5);
  let hw=0,d=0,aw=0,hg=0,ag=0;
  for(const f of rows){const homeIsH=f.teams.home.id===homeId;const gh=homeIsH?f.goals.home:f.goals.away,ga=homeIsH?f.goals.away:f.goals.home;hg+=gh;ag+=ga;if(gh>ga)hw++;else if(gh===ga)d++;else aw++}
  return {n:rows.length,homeWins:hw,draws:d,awayWins:aw,homeGoals:hg,awayGoals:ag,rows:rows.map(f=>({date:f.fixture.date,home:f.teams.home.name,away:f.teams.away.name,score:`${f.goals.home}-${f.goals.away}`}))};
}
function observedTeam(s,venue){
  return {matches:s.n,ppg:s.n?s.pts/s.n:null,gfPerMatch:s.n?s.gf/s.n:null,gaPerMatch:s.n?s.ga/s.n:null,venueMatches:venue.n,venueGF:venue.n?venue.gf/venue.n:null,venueGA:venue.n?venue.ga/venue.n:null};
}
function h2hFactor(h){if(!h||h.n<2)return 1;const diff=(h.homeWins-h.awayWins)/h.n;return clamp(1+diff*.025,.97,1.03)}
function confidence(sample){return sample<4?"molto bassa":sample<7?"bassa":sample<11?"media":sample<18?"buona":"alta"}
function pois(k,l){let f=1;for(let i=2;i<=k;i++)f*=i;return Math.exp(-l)*Math.pow(l,k)/f}
function model(lh,la,extra={}){
  let o=0,d=0,t=0,o15=0,o25=0,o35=0,b=0,s=[];
  for(let h=0;h<=9;h++)for(let a=0;a<=9;a++){const p=pois(h,lh)*pois(a,la);if(h>a)o+=p;else if(h===a)d+=p;else t+=p;if(h+a>1)o15+=p;if(h+a>2)o25+=p;if(h+a>3)o35+=p;if(h>0&&a>0)b+=p;s.push({score:`${h}-${a}`,p})}
  const z=o+d+t,srt=s.sort((x,y)=>y.p-x.p),p1=o/z,px=d/z,p2=t/z;
  return {p1,px,p2,dc1x:p1+px,dc12:p1+p2,dcx2:px+p2,dnb1:p1/(p1+p2),dnb2:p2/(p1+p2),over15:o15,under15:1-o15,over:o25,under:1-o25,over35:o35,under35:1-o35,btts:b,noBtts:1-b,scores:srt.slice(0,3),lh,la,...extra};
}

async function domesticModel(league,cfg,key,cur,prev,from,to){
  const [upR,curR,prevR]=await Promise.all([
    api(`/fixtures?league=${league}&season=${cur}&from=${from}&to=${to}&timezone=Europe%2FRome`,key),
    api(`/fixtures?league=${league}&season=${cur}&timezone=Europe%2FRome`,key),
    api(`/fixtures?league=${league}&season=${prev}&timezone=Europe%2FRome`,key)
  ]);
  const bad=[upR,curR,prevR].find(x=>!x.ok); if(bad)return json(apiError(bad),502);
  const cf=finished(curR.data.response),pf=finished(prevR.data.response),curAvg=avg(cf),prevAvg=avg(pf),curBase=leagueBase(cf),prevBase=leagueBase(pf);
  const elo=buildElo([...pf,...cf]);
  const matches=(upR.data.response||[]).filter(pending).map(x=>{
    const hid=x.teams.home.id,aid=x.teams.away.id,hs=teamStats(cf,hid),as=teamStats(cf,aid),hsp=teamStats(pf,hid),asp=teamStats(pf,aid);
    const hw=currentWeight(hs.n),aw=currentWeight(as.n),hStruct=blend(structuralPower(hsp,prevBase),structuralPower(hs,curBase),hw),aStruct=blend(structuralPower(asp,prevBase),structuralPower(as,curBase),aw);
    const hElo=eloPower(hid,elo),aElo=eloPower(aid,elo);
    const hv=venueStats(cf,hid,true),av=venueStats(cf,aid,false),hvp=venueStats(pf,hid,true),avp=venueStats(pf,aid,false);
    const hAtk=venueFactor(hv,hvp,curAvg.home,prevAvg.home,"attack"),hDef=venueFactor(hv,hvp,curAvg.away,prevAvg.away,"defense"),aAtk=venueFactor(av,avp,curAvg.away,prevAvg.away,"attack"),aDef=venueFactor(av,avp,curAvg.home,prevAvg.home,"defense");
    const hf=weightedForm(cf,hid,elo),af=weightedForm(cf,aid,elo),hr=restDays(cf,hid,x.fixture.date),ar=restDays(cf,aid,x.fixture.date);
    const h2h=h2hStats([...pf,...cf],hid,aid),h2hf=h2hFactor(h2h);
    const homePower=clamp(.58*hElo+.42*hStruct,.72,1.40),awayPower=clamp(.58*aElo+.42*aStruct,.72,1.40);
    let lh=curAvg.home*clamp(homePower/awayPower,.72,1.38)*hAtk*aDef*(1+(hf-.5)*.12)*restFactor(hr)*h2hf;
    let la=curAvg.away*clamp(awayPower/homePower,.72,1.38)*aAtk*hDef*(1+(af-.5)*.12)*restFactor(ar)/h2hf;
    const sample=Math.min(hs.n,as.n); const cert=Math.min(1,sample/12); lh=blend(curAvg.home,lh,.35+.65*cert);la=blend(curAvg.away,la,.35+.65*cert);lh=clamp(lh,.55,2.70);la=clamp(la,.45,2.45);
    const conf=confidence(sample),explain=[`Elo dinamico: ${x.teams.home.name} ${Math.round(elo.elo.get(hid)||1500)} • ${x.teams.away.name} ${Math.round(elo.elo.get(aid)||1500)}.`,`Forza strutturale separata: ${hStruct.toFixed(2)} • ${aStruct.toFixed(2)} (1.00 = media campionato).`,`Forma pesata per recenza e forza avversari: ${hf.toFixed(2)} • ${af.toFixed(2)}.`,`Casa/trasferta: ${hv.n} gare casa • ${av.n} gare trasferta.`,`H2H: ${h2h.n} precedenti, ${h2h.homeWins}-${h2h.draws}-${h2h.awayWins}; peso massimo ±3%.`,`Riposo stimato: ${hr??"n/d"} • ${ar??"n/d"} giorni.`,`Campione stagione corrente: ${hs.n} • ${as.n} gare.`];
    return pack(x,model(lh,la,{method:"Forza strutturale + Elo dinamico + forma pesata + casa/trasferta + riposo + H2H leggero",note:"xG modello = gol attesi stimati dal modello, non xG ufficiale del provider. H2H ha peso ridotto per non sovrastimare precedenti vecchi.",explain,homePower,awayPower,homeStructural:hStruct,awayStructural:aStruct,homeElo:Math.round(elo.elo.get(hid)||1500),awayElo:Math.round(elo.elo.get(aid)||1500),homeForm:hf,awayForm:af,homeRest:hr,awayRest:ar,h2h,observed:{home:observedTeam(hs,hv),away:observedTeam(as,av)},confidence:conf,sample}));
  });
  return response({ok:true,matches,meta:{leagueName:cfg.name,apiCalls:3,version:"1.2",model:"Calcio AI 1.2",requestsRemaining:lastRequestsRemaining}},200,21600);
}

const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ß/g,"ss").replace(/ø/g,"o").replace(/\b(fc|cf|afc|sc|fk|ac|as|rc|vfb|rb|kv)\b/g,"").replace(/[^a-z0-9]/g,"");
const NAME_LEAGUE={realmadrid:140,barcelona:140,atleticomadrid:140,atleticodemadrid:140,villarreal:140,realbetis:140,inter:135,intermilan:135,juventus:135,napoli:135,milan:135,acmilan:135,roma:135,asroma:135,astonvilla:39,arsenal:39,liverpool:39,manchestercity:39,manchesterunited:39,chelsea:39,tottenham:39,bayernmunchen:78,bayernmunich:78,borussiadortmund:78,stuttgart:78,leipzig:78,parissaintgermain:61,psg:61,lille:61,lens:61,psv:88,psveindhoven:88,feyenoord:88,ajax:88,porto:94,fcporto:94,benfica:94,sporting:94,sportingcp:94,clubbrugge:144,aekathens:197,olympiacos:197,panathinaikos:197,lask:218,salzburg:218,viking:103,bodoglimt:103,galatasaray:203,fenerbahce:203,besiktas:203,shakhtardonetsk:333,dynamokyiv:333,slaviapraha:345,slaviaprague:345,slovanbratislava:332};
function statsForTeam(fs,team){const tn=norm(team.name);let n=0,gf=0,ga=0,pts=0;for(const f of fs||[]){const home=f.teams.home.id===team.id||norm(f.teams.home.name)===tn,away=f.teams.away.id===team.id||norm(f.teams.away.name)===tn;if(!home&&!away)continue;const g=home?f.goals.home:f.goals.away,z=home?f.goals.away:f.goals.home;n++;gf+=g;ga+=z;pts+=g>z?3:g===z?1:0}return n?{n,gf,ga,pts}:null}
function simplePower(s){if(!s)return null;return clamp(1+.15*((s.pts/s.n)-1.35)+.09*((s.gf-s.ga)/s.n),.72,1.40)}
function chooseLeague(resp){const allowed=[];for(const x of resp||[]){const l=x.league||{},c=x.country||{};if(String(l.type).toLowerCase()!=="league"||String(c.name).toLowerCase()==="world")continue;const nm=String(l.name||"").toLowerCase();if(/women|reserve|u19|u21|youth|academy|cup|super cup|champions|europa|conference/.test(nm))continue;allowed.push({id:Number(l.id),name:l.name,country:c.name||""})}return allowed.sort((a,b)=>((LEAGUE_STRENGTH[b.id]||.8)-(LEAGUE_STRENGTH[a.id]||.8)))[0]||null}

async function europeanModel(league,cfg,key,cur,prev,from,to){
  const [euroR,teamsR]=await Promise.all([api(`/fixtures?league=${league}&season=${cur}&timezone=Europe%2FRome`,key),api(`/teams?league=${league}&season=${cur}`,key)]); const bad=[euroR,teamsR].find(x=>!x.ok);if(bad)return json(apiError(bad,"Europa"),502);
  const allEuro=euroR.data.response||[],ef=finished(allEuro),upcoming=allEuro.filter(x=>{const d=String(x.fixture?.date||"").slice(0,10);return pending(x)&&d>=from&&d<=to}),euroAvg=avg(ef);
  const meta=new Map((teamsR.data.response||[]).map(x=>[Number(x.team?.id),{name:x.team?.name||"",country:x.team?.country||x.country?.name||""}]));
  const clubs=[...new Map(upcoming.flatMap(x=>[[x.teams.home.id,{id:x.teams.home.id,name:x.teams.home.name}],[x.teams.away.id,{id:x.teams.away.id,name:x.teams.away.name}]])).values()];
  const teamLeague={}; const unresolved=[];
  for(const t of clubs){const m=meta.get(Number(t.id))||{};const lid=COUNTRY_LEAGUE[m.country]||NAME_LEAGUE[norm(t.name)]||TEAM_DOMESTIC_LEAGUE[t.id]||null;if(lid)teamLeague[t.id]={id:Number(lid),name:LEAGUE_NAMES[lid]||`League ${lid}`,country:m.country||""};else unresolved.push(t)}
  // Dynamic discovery is a fallback only. Most clubs are resolved from country/name/id,
  // so capping this prevents one European screen from exhausting the minute quota.
  let dynamicCalls=0;
  for(const t of unresolved.slice(0,2)){
    const r=await api(`/leagues?team=${t.id}&current=true`,key);
    dynamicCalls++;
    if(r.ok){const dl=chooseLeague(r.data.response);if(dl)teamLeague[t.id]=dl}
  }

  const lids=[...new Set(Object.values(teamLeague).map(x=>x.id))],fixtures={};
  let leagueCalls=0;
  // Early season uses the previous completed domestic season as stable prior; from
  // November onward the current domestic season is mature enough. This halves the
  // cold-start calls versus downloading both seasons for every domestic league.
  const month=Number(String(from).slice(5,7)||9);
  const baseSeason=month<=10?prev:cur;
  for(const lid of lids){
    const r=await api(`/fixtures?league=${lid}&season=${baseSeason}&timezone=Europe%2FRome`,key);
    leagueCalls++;
    const rows=r.ok?finished(r.data.response||[]):[];
    fixtures[lid]={prev:baseSeason===prev?rows:[],cur:baseSeason===cur?rows:[]};
  }
  const eloEuro=buildElo(ef);
  const matches=upcoming.map(x=>{const ht={id:x.teams.home.id,name:x.teams.home.name},at={id:x.teams.away.id,name:x.teams.away.name},hl=teamLeague[ht.id],al=teamLeague[at.id];if(!hl||!al)return pack(x,{insufficient:true,reason:"Campionato domestico non identificato per una delle squadre.",explain:[`${ht.name}: ${hl?hl.name:"lega non risolta"}`,`${at.name}: ${al?al.name:"lega non risolta"}`,`Nessuna percentuale viene inventata senza una base reale sufficiente.`]});
    const hsP=statsForTeam(fixtures[hl.id]?.prev,ht),hsC=statsForTeam(fixtures[hl.id]?.cur,ht),asP=statsForTeam(fixtures[al.id]?.prev,at),asC=statsForTeam(fixtures[al.id]?.cur,at);if(!hsP&&!hsC||!asP&&!asC)return pack(x,{insufficient:true,reason:"Dati domestici insufficienti per una delle squadre.",explain:[`${ht.name}: ${hsC?.n||0} gare correnti / ${hsP?.n||0} precedenti.`,`${at.name}: ${asC?.n||0} gare correnti / ${asP?.n||0} precedenti.`]});
    const blendTeam=(p,c)=>{const pp=simplePower(p)??1,cc=simplePower(c)??pp,w=currentWeight(c?.n||0);return clamp(blend(pp,cc,w),.74,1.38)}; const hp=blendTeam(hsP,hsC)*(LEAGUE_STRENGTH[hl.id]||.90),ap=blendTeam(asP,asC)*(LEAGUE_STRENGTH[al.id]||.90);const hEuro=teamStats(ef,ht.id),aEuro=teamStats(ef,at.id),hf=weightedForm(ef,ht.id,eloEuro),af=weightedForm(ef,at.id,eloEuro),hr=restDays(ef,ht.id,x.fixture.date),ar=restDays(ef,at.id,x.fixture.date);const hpow=clamp(hp*(1+(hf-.5)*.06),.72,1.45),apow=clamp(ap*(1+(af-.5)*.06),.72,1.45);let lh=(ef.length?euroAvg.home:1.45)*clamp(hpow/apow,.72,1.40)*restFactor(hr),la=(ef.length?euroAvg.away:1.25)*clamp(apow/hpow,.72,1.40)*restFactor(ar);lh=clamp(lh,.55,2.75);la=clamp(la,.45,2.55);const sample=Math.min((hsC?.n||0)+(hEuro.n||0),(asC?.n||0)+(aEuro.n||0));const conf=confidence(sample);const h2h=h2hStats(ef,ht.id,at.id),explain=[`${ht.name}: ${hl.name}, coefficiente ${(LEAGUE_STRENGTH[hl.id]||.90).toFixed(2)}.`,`${at.name}: ${al.name}, coefficiente ${(LEAGUE_STRENGTH[al.id]||.90).toFixed(2)}.`,`Forza strutturale comparabile tra leghe: ${hp.toFixed(2)} • ${ap.toFixed(2)}.`,`Elo europeo: ${Math.round(eloEuro.elo.get(ht.id)||1500)} • ${Math.round(eloEuro.elo.get(at.id)||1500)}.`,`Forma europea pesata: ${hf.toFixed(2)} • ${af.toFixed(2)}.`,`H2H nelle competizioni europee disponibili: ${h2h.n}.`,`Riposo: ${hr??"n/d"} • ${ar??"n/d"} giorni.`];return pack(x,model(lh,la,{method:`${cfg.name}: forza strutturale domestica + coefficiente lega + Elo/forma europea + riposo`,note:"xG modello = stima del modello, non dato xG ufficiale. Per le coppe l'H2H mostra solo precedenti presenti nel dataset europeo disponibile.",explain,homePower:hpow,awayPower:apow,homeStructural:hp,awayStructural:ap,homeElo:Math.round(eloEuro.elo.get(ht.id)||1500),awayElo:Math.round(eloEuro.elo.get(at.id)||1500),homeForm:hf,awayForm:af,homeRest:hr,awayRest:ar,h2h,confidence:conf,sample}))});
  return response({ok:true,matches,meta:{leagueName:cfg.name,apiCalls:2+dynamicCalls+leagueCalls,version:"1.2",model:"Calcio AI 1.2",requestsRemaining:lastRequestsRemaining}},200,21600);
}

async function analyze(request,env){
  const key=env.API_FOOTBALL_KEY;if(!key)return json("API key mancante",500);const url=new URL(request.url),league=String(url.searchParams.get("league")||"135"),cfg=LEAGUES[league];if(!cfg)return json("Campionato non supportato",400);const now=new Date(),cur=now.getUTCMonth()>=6?now.getUTCFullYear():now.getUTCFullYear()-1,prev=cur-1,from=now.toISOString().slice(0,10),to=new Date(now.getTime()+14*864e5).toISOString().slice(0,10);return cfg.type==="europe"?europeanModel(league,cfg,key,cur,prev,from,to):domesticModel(league,cfg,key,cur,prev,from,to);
}

function parseOdds(resp){
  const preferred=["Bet365","1xBet","Betfair","Bwin"];
  for(const name of [...preferred,""])for(const page of resp||[])for(const bm of page.bookmakers||[]){if(name&&bm.name!==name)continue;const bet=(bm.bets||[]).find(b=>/match winner/i.test(String(b.name||"")));if(!bet)continue;const v={};for(const x of bet.values||[]){const k=String(x.value||"").toLowerCase();if(k==="home")v.home=x.odd;if(k==="draw")v.draw=x.odd;if(k==="away")v.away=x.odd}if(v.home||v.draw||v.away)return {...v,bookmaker:bm.name||"",updated:page.update||""}}
  return {};
}
function parseInjuries(resp){return (resp||[]).map(x=>({team:x.team?.name||"",player:x.player?.name||"",reason:x.player?.reason||x.player?.type||""})).filter(x=>x.player)}
function parseLineups(resp){return (resp||[]).map(x=>({team:x.team?.name||"",formation:x.formation||"",startXI:(x.startXI||[]).map(y=>y.player?.name).filter(Boolean)}))}
async function details(request,env){const key=env.API_FOOTBALL_KEY;if(!key)return json("API key mancante",500);const fixture=new URL(request.url).searchParams.get("fixture")||"";if(!/^\d+$/.test(fixture))return json("Fixture non valido",400);const [o,i,l]=await Promise.all([api(`/odds?fixture=${fixture}`,key),api(`/injuries?fixture=${fixture}`,key),api(`/fixtures/lineups?fixture=${fixture}`,key)]);return response({ok:true,fixture,odds:parseOdds(o.ok?o.data.response:[]),injuries:parseInjuries(i.ok?i.data.response:[]),lineups:parseLineups(l.ok?l.data.response:[]),apiCalls:3,requestsRemaining:lastRequestsRemaining},200,1800)}
function response(body,status=200,smax=1800){return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=UTF-8","Cache-Control":status>=200&&status<300?`public, max-age=300, s-maxage=${smax}, stale-while-revalidate=7200`:"no-store"}})}
function json(message,status){return response({ok:false,message},status,0)}
function htmlResponse(){const binary=atob(INDEX_HTML_B64),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));return new Response(bytes,{headers:{"content-type":"text/html; charset=UTF-8","cache-control":"public, max-age=3600"}})}

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);if(request.method!=="GET")return new Response("Method Not Allowed",{status:405});
    if(url.pathname==="/"||url.pathname==="/index.html")return htmlResponse();
    if(url.pathname!=="/api/analyze"&&url.pathname!=="/api/details")return new Response("Not Found",{status:404});
    const cache=caches.default,cacheKey=new Request(url.toString(),{method:"GET"});const useCache=url.searchParams.get("fresh")!=="1";if(useCache){const hit=await cache.match(cacheKey);if(hit)return hit}
    const res=url.pathname==="/api/analyze"?await analyze(request,env):await details(request,env);if(res.ok)ctx.waitUntil(cache.put(cacheKey,res.clone()));return res;
  }
};
