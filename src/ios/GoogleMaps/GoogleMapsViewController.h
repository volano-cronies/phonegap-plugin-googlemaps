//
//  GoogleMapsViewController.h
//  cordova-googlemaps-plugin v2
//
//  Created by Masashi Katsumata.
//
//

#import <Cordova/CDV.h>
#import <UIKit/UIKit.h>
#import <math.h>
#import "PluginUtil.h"
#import "NSData+Base64.h"
#import "MyPlgunProtocol.h"
#import <GoogleMaps/GoogleMaps.h>

@interface GoogleMapsViewController : UIViewController<GMSMapViewDelegate, GMSIndoorDisplayDelegate>

@property (nonatomic, strong) UIView* webView;
@property (nonatomic) NSMutableDictionary* plugins;
@property (nonatomic) BOOL isFullScreen;
@property (nonatomic) BOOL isDragging;
@property (nonatomic) CGRect screenSize;
@property (nonatomic) CGFloat screenScale;
@property (nonatomic) BOOL debuggable;
@property (nonatomic) NSString *mapId;
@property (nonatomic, strong) GMSMapView* map;
@property (nonatomic) BOOL clickable;
@property (nonatomic) BOOL isRenderedAtOnce;
@property (nonatomic) GMSMarker* activeMarker;
@property (nonatomic, readwrite, strong) NSString *mapDivId;
@property (nonatomic, strong) NSMutableDictionary* objects;
@property (atomic, strong) NSOperationQueue *executeQueue;


//- (UIView *)mapView:(GMSMapView *)mapView markerInfoWindow:(GMSMarker *)marker;
- (id)initWithOptions:(NSDictionary *) options;

- (BOOL)didTapMyLocationButtonForMapView:(GMSMapView *)mapView;

- (void)execJS: (NSString *)jsString;
- (void) didChangeActiveBuilding: (GMSIndoorBuilding *)building;
- (void) didChangeActiveLevel: (GMSIndoorLevel *)level;
- (void) didTapZoomInButton:(UIButton *)button;
- (void) didTapZoomOutButton:(UIButton *)button;
@end


@interface CDVPlugin (GoogleMapsPlugin)
- (void)setGoogleMapsViewController: (GoogleMapsViewController*)viewCtrl;
@end
