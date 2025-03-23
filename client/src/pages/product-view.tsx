<div className="mt-4 flex justify-end gap-2">
                    <Button variant="destructive" onClick={() => handleRejectOffer(product.id)}>
                      Reject
                    </Button>
                    <Button onClick={() => handleAcceptOffer(product.id)}>
                      Accept
                    </Button>
                  </div>