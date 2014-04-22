import numpy as np
import cv2
import time,math
from socketIO_client import SocketIO

cap=cv2.VideoCapture(0)
time.sleep(5)
winName = "Motion detector"
cv2.namedWindow(winName,cv2.CV_WINDOW_AUTOSIZE)
host = '10.143.26.91'
port = 9877
paddle = 1
while cap.isOpened():
	ret,fi = cap.read()
	f = fi[100:500, 100:500]
	fGray = cv2.cvtColor(f,cv2.COLOR_BGR2GRAY)
	mask = np.zeros(fGray.shape,np.uint8)
	minVal,maxVal,minLoc,maxLoc = cv2.minMaxLoc(fGray,mask=mask)
	sum = 0
	count = 0
	w = range(fGray.shape[0])
	h = range(fGray.shape[1])
	for i in w:
		for j in h:
			val = fGray.item(i,j)
			if val < 180:
				sum = sum + val
				++count
	rangeT = 15
	if count:
		rangeT = 190 - sum/count
	ret, fThresh = cv2.threshold(fGray,minVal+rangeT,255,cv2.THRESH_BINARY_INV+cv2.THRESH_OTSU)
	fBlur = cv2.GaussianBlur(fThresh,(5,5),0)
	contours, hierarchy = cv2.findContours(fBlur,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
	max_area = 0
	for i in range(len(contours)):
		cnt = contours[i]
		area = cv2.contourArea(cnt)
		if(area>max_area):
			max_area = area
			ci = i
	cnt = contours[ci]
	hull = cv2.convexHull(cnt)
	#cv2.drawContours(f,[cnt],0,(0,255,0),3)
	#cv2.drawContours(f,[hull],0,(0,0,255),3)
	moments = cv2.moments(cnt)
	if moments['m00']!=0:
		cx = int(moments['m10']/moments['m00'])
		cy = int(moments['m01']/moments['m00'])
	center = (cx,cy)
	mind = 0
	maxd = 0
	i = 0
	fingers = 0
	cnt = cv2.approxPolyDP(cnt,0.01*cv2.arcLength(cnt,True),True)
	hull = cv2.convexHull(cnt,returnPoints = False)
	dist = cv2.pointPolygonTest(cnt,center,True)
	cv2.circle(f,center,30,[0,0,255],1)
	if(1):
		try:
			defects = cv2.convexityDefects(cnt,hull)
			try:
				r = range(defects.shape[0])
				for i in r:
					s1,e1,f1,d1 = defects[i,0]
					start = tuple(cnt[s1][0])
					end = tuple(cnt[e1][0])
					far = tuple(cnt[f1][0])
					distFromCenter = math.sqrt(math.pow(start[0]-center[0],2)+math.pow(start[1]-center[1],2))
					if distFromCenter > 4*25 and start[1]-center[1] < 50:
						fingers+=1
						cv2.circle(f,start,10,[0,0,255],1)
						cv2.line(f,start,center,[0,255,0],2)
				print 'F:'+str(fingers)
				if fingers > 0:
					with SocketIO(host,port) as socketIO:
						socketIO.emit('message_to_server',{'paddle':paddle,'message':fingers},None)
			except AttributeError as e:
				print 'Exception:'+str(e)
		except:
			print 'Exception in convexityDefects'
	
	cv2.imshow(winName,f)
	if cv2.waitKey(1) & 0xFF == ord('q'):
		cap.release()
		cv2.destroyWindow(winName)
		break
	#time.sleep(4)
print "Bye"