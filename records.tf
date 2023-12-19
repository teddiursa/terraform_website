resource "aws_route53_record" "certRecord" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      record  = dvo.resource_record_value
      type    = dvo.resource_record_type
      zone_id = aws_route53_zone.hostedZone.zone_id
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = each.value.zone_id


}

#www  cert
resource "aws_route53_record" "record" {
  zone_id = aws_route53_zone.hostedZone.zone_id
  name    = var.fullDomainName
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.distribution.domain_name
    zone_id                = aws_cloudfront_distribution.distribution.hosted_zone_id
    evaluate_target_health = true
  }
}

#root cert
resource "aws_route53_record" "rootRecord" {
  zone_id = aws_route53_zone.hostedZone.zone_id
  name    = var.domainName
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.rootDistribution.domain_name
    zone_id                = aws_cloudfront_distribution.rootDistribution.hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "record6" {
  zone_id = aws_route53_zone.hostedZone.zone_id
  name    = var.fullDomainName
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.distribution.domain_name
    zone_id                = aws_cloudfront_distribution.distribution.hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "rootRecord6" {
  zone_id = aws_route53_zone.hostedZone.zone_id
  name    = var.domainName
  type = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.rootDistribution.domain_name
    zone_id                = aws_cloudfront_distribution.rootDistribution.hosted_zone_id
    evaluate_target_health = true
  }
}



