//
//  IAmPort.m
//  IAmPort
//
//  Created by hanalabs on 25/05/2017.
//  Copyright © 2017 hanalabs. All rights reserved.
//

#import "IAmPort.h"
#import <React/RCTViewManager.h>
#import <MapKit/MapKit.h>

// @interface IAmPort : RCTViewManager
// @end

@implementation IAmPort

// To export a module named IAmPort
RCT_EXPORT_MODULE();

// This would name the module AwesomeIAmPort instead
// RCT_EXPORT_MODULE(AwesomeIAmPort);
RCT_EXPORT_METHOD(addEvent:(NSString *)name location:(NSString *)location)
{
  RCTLogInfo(@"Pretending to create an event %@ at %@", name, location);
}

- (UIView *)view
{
    return [[MKMapView alloc] init];
}


@end
